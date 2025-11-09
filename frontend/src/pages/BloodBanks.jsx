"use client"

import { useEffect, useMemo, useState } from "react"
import { MapPin, Phone, Droplet, Plus, Edit, Navigation, Droplets, AlertCircle, Check } from "lucide-react"
import { MapContainer, Marker, Popup, TileLayer, useMap } from "react-leaflet"
import L from "leaflet"
import "leaflet/dist/leaflet.css"
import client from "../api/client"

const isValidCoordinate = (lat, lon) => Number.isFinite(lat) && Number.isFinite(lon)

const createMarkerIcon = (color) =>
  L.divIcon({
    className: "",
    html: `
      <div style="
        position: relative;
        width: 28px;
        height: 28px;
      ">
        <span style="
          position: absolute;
          inset: 0;
          border-radius: 50%;
          background: ${color};
          border: 4px solid rgba(15,23,42,0.9);
          box-shadow: 0 10px 20px rgba(0,0,0,0.35);
        "></span>
        <span style="
          position:absolute;
          bottom:-12px;
          left:50%;
          transform:translateX(-50%);
          width:0;
          height:0;
          border-left:8px solid transparent;
          border-right:8px solid transparent;
          border-top:12px solid ${color};
        "></span>
      </div>
    `,
    iconSize: [28, 40],
    iconAnchor: [14, 36],
    popupAnchor: [0, -30],
  })

const MapBounds = ({ userLocation, providers = [] }) => {
  const map = useMap()

  useEffect(() => {
    const points = []

    if (isValidCoordinate(userLocation?.latitude, userLocation?.longitude)) {
      points.push([userLocation.latitude, userLocation.longitude])
    }

    providers.forEach((provider) => {
      if (isValidCoordinate(provider.latitude, provider.longitude)) {
        points.push([provider.latitude, provider.longitude])
      }
    })

    if (points.length === 0) {
      return
    }

    if (points.length === 1) {
      map.setView(points[0], 13)
    } else {
      map.fitBounds(points, { padding: [40, 40] })
    }
  }, [map, userLocation, providers])

  return null
}

export default function BloodBanks() {
  const [user, setUser] = useState(null)
  const [banks, setBanks] = useState([])
  const [nearbyProviders, setNearbyProviders] = useState([])
  const [loading, setLoading] = useState(true)
  const [selectedBloodType, setSelectedBloodType] = useState("O+")
  const [userLocation, setUserLocation] = useState(null)
  const [myProviderEntry, setMyProviderEntry] = useState(null)
  const [showCreateForm, setShowCreateForm] = useState(false)
  const [showUpdateForm, setShowUpdateForm] = useState(false)

  const bloodTypes = ["O+", "O-", "A+", "A-", "B+", "B-", "AB+", "AB-"]

  const [formData, setFormData] = useState({
    organizationName: "",
    address: "",
    latitude: "",
    longitude: "",
    phone: "",
    email: "",
  })

  const [inventoryData, setInventoryData] = useState({
    "O+": 0,
    "O-": 0,
    "A+": 0,
    "A-": 0,
    "B+": 0,
    "B-": 0,
    "AB+": 0,
    "AB-": 0,
  })

  const hasUserLocation = isValidCoordinate(userLocation?.latitude, userLocation?.longitude)

  const providerMarkers = useMemo(() => {
    return nearbyProviders
      .map((provider) => ({
        ...provider,
        latitude: Number(provider.latitude),
        longitude: Number(provider.longitude),
      }))
      .filter((provider) => Number.isFinite(provider.latitude) && Number.isFinite(provider.longitude))
  }, [nearbyProviders])

  const mapDefaultCenter = useMemo(() => {
    if (hasUserLocation) {
      return [userLocation.latitude, userLocation.longitude]
    }
    if (providerMarkers.length > 0) {
      return [providerMarkers[0].latitude, providerMarkers[0].longitude]
    }
    return [28.6139, 77.209] // New Delhi fallback
  }, [hasUserLocation, userLocation, providerMarkers])

  const userMarkerIcon = useMemo(() => createMarkerIcon("#22d3ee"), [])
  const providerMarkerIcon = useMemo(() => createMarkerIcon("#f87171"), [])

  useEffect(() => {
    const userData = localStorage.getItem("user")
    if (userData) {
      setUser(JSON.parse(userData))
    }
  }, [])

  useEffect(() => {
    fetchProviders()
  }, [])

  useEffect(() => {
    if (user?.role === "patient" && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setUserLocation({ latitude, longitude })
        findNearbyProviders(latitude, longitude)
      })
    } else if (user?.role === "provider") {
      fetchMyProviderEntry()
    }
  }, [user])

  const fetchProviders = async () => {
    try {
      const { data } = await client.get("/blood-banks")
      setBanks(data)
    } catch (err) {
      console.error("Error fetching providers:", err)
    } finally {
      setLoading(false)
    }
  }

  const fetchMyProviderEntry = async () => {
    try {
      const { data } = await client.get("/blood-banks/my-entry")
      setMyProviderEntry(data)
      if (data) {
        setInventoryData(data.bloodInventory)
      }
    } catch (err) {
      console.log("No entry found")
    }
  }

  const findNearbyProviders = async (lat, lon) => {
    try {
      const { data } = await client.post("/blood-banks/nearby", {
        latitude: lat,
        longitude: lon,
        bloodType: selectedBloodType,
        radiusKm: 50,
      })
      setNearbyProviders(data)
    } catch (err) {
      console.error("Error finding nearby providers:", err)
    }
  }

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((position) => {
        const { latitude, longitude } = position.coords
        setFormData({
          ...formData,
          latitude: latitude.toFixed(6),
          longitude: longitude.toFixed(6),
        })
      })
    }
  }

  const handleCreateSubmit = async (e) => {
    e.preventDefault()
    try {
      await client.post("/blood-banks/create", formData)
      setFormData({
        organizationName: "",
        address: "",
        latitude: "",
        longitude: "",
        phone: "",
        email: "",
      })
      setShowCreateForm(false)
      fetchMyProviderEntry()
      fetchProviders()
    } catch (err) {
      console.error("Error creating entry:", err)
    }
  }

  const handleUpdateInventory = async (e) => {
    e.preventDefault()
    try {
      await client.put("/blood-banks/update-inventory", { bloodInventory: inventoryData })
      fetchMyProviderEntry()
      setShowUpdateForm(false)
      fetchProviders()
    } catch (err) {
      console.error("Error updating inventory:", err)
    }
  }

  if (user?.role === "patient") {

    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Find Blood Banks & Hospitals</h1>
            <p className="text-slate-400">Locate nearby providers with the blood type you need</p>
          </div>

          {/* Blood Type Selector */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-8 backdrop-blur">
            <label className="block text-sm font-medium text-slate-200 mb-4">Select Blood Type</label>
            <div className="flex flex-wrap gap-3">
              {bloodTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setSelectedBloodType(type)
                    if (userLocation) {
                      findNearbyProviders(userLocation.latitude, userLocation.longitude)
                    }
                  }}
                  className={`px-6 py-3 rounded-lg font-semibold transition-all ${
                    selectedBloodType === type
                      ? "bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/50"
                      : "bg-slate-700/50 border border-slate-600 text-slate-300 hover:border-cyan-500/50"
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Horizontal Scrollable Cards */}
          {nearbyProviders.length > 0 && (
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
                <Droplets className="w-6 h-6 text-cyan-400" />
                Nearest Providers ({nearbyProviders.length})
              </h2>
              <div className="overflow-x-auto pb-4 scroll-smooth">
                <div className="flex gap-4 min-w-max">
                  {nearbyProviders.map((provider) => (
                    <div
                      key={provider._id}
                      className="flex-shrink-0 w-80 bg-slate-800/50 border border-slate-700 rounded-lg p-5 hover:border-cyan-500/50 transition backdrop-blur group"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="text-lg font-semibold text-white group-hover:text-cyan-400 transition">
                            {provider.organizationName}
                          </h3>
                          <p className="text-slate-400 text-sm">{provider.userId?.name}</p>
                        </div>
                        <div className="bg-cyan-500/20 px-3 py-1 rounded-full flex-shrink-0">
                          <p className="text-cyan-400 font-bold text-sm">{provider.distance.toFixed(1)} km</p>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-start gap-2 text-slate-300 text-sm">
                          <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
                          <span>{provider.address}</span>
                        </div>
                        {provider.phone && (
                          <div className="flex items-center gap-2 text-slate-300 text-sm">
                            <Phone className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                            {provider.phone}
                          </div>
                        )}
                      </div>

                      <div className="bg-slate-700/50 rounded p-3 mb-3 border border-slate-600/50">
                        <p className="text-slate-300 text-xs font-medium mb-2">Available Units</p>
                        <div className="flex items-center justify-between">
                          <span className="text-cyan-400 font-bold text-lg">{selectedBloodType}</span>
                          <span
                            className={`font-bold text-lg ${provider.bloodInventory[selectedBloodType] > 0 ? "text-green-400" : "text-red-400"}`}
                          >
                            {provider.bloodInventory[selectedBloodType] || 0}
                          </span>
                        </div>
                      </div>

                      {provider.available ? (
                        <button className="w-full bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white py-2 rounded-lg transition font-semibold flex items-center justify-center gap-2">
                          <Check className="w-4 h-4" />
                          Available
                        </button>
                      ) : (
                        <button className="w-full bg-red-600/30 text-red-200 py-2 rounded-lg font-medium flex items-center justify-center gap-2 border border-red-500/50">
                          <AlertCircle className="w-4 h-4" />
                          Not Available
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Map Card - Always Visible */}
          <div className="bg-slate-800/50 border border-slate-700 rounded-lg overflow-hidden backdrop-blur">
            <div className="p-6 border-b border-slate-700">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <MapPin className="w-5 h-5 text-cyan-400" />
                Location Map - Blood Bank Locator
              </h2>
            </div>

            {/* Map Container */}
            <div className="relative w-full h-96 bg-slate-700">
              <MapContainer
                center={mapDefaultCenter}
                zoom={13}
                scrollWheelZoom
                className="w-full h-full"
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <MapBounds userLocation={userLocation} providers={providerMarkers} />

                {hasUserLocation && (
                  <Marker
                    position={[userLocation.latitude, userLocation.longitude]}
                    icon={userMarkerIcon}
                    key="user-location"
                  >
                    <Popup>
                      <div className="text-sm space-y-1">
                        <p className="font-semibold text-slate-900">You are here</p>
                        <p className="text-slate-600">
                          {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                        </p>
                      </div>
                    </Popup>
                  </Marker>
                )}

                {providerMarkers.map((provider) => {
                  const availableUnits = provider.bloodInventory?.[selectedBloodType] ?? 0
                  const availabilityClass = availableUnits > 0 ? "text-green-600" : "text-red-600"

                  return (
                    <Marker
                      key={provider._id}
                      position={[provider.latitude, provider.longitude]}
                      icon={providerMarkerIcon}
                    >
                      <Popup>
                        <div className="text-sm space-y-1 max-w-[220px]">
                          <p className="font-semibold text-slate-900">{provider.organizationName}</p>
                          {provider.address && <p className="text-slate-600">{provider.address}</p>}
                          {provider.phone && <p className="text-slate-600">Phone: {provider.phone}</p>}
                          <p className={`font-semibold ${availabilityClass}`}>
                            {selectedBloodType}: {availableUnits} units
                          </p>
                        </div>
                      </Popup>
                    </Marker>
                  )
                })}
              </MapContainer>

              {/* Location Markers Info - Always Visible with Better Styling */}
              <div className="absolute bottom-4 left-4 bg-slate-900/95 border border-cyan-500/50 rounded-lg p-4 backdrop-blur-lg max-w-xs shadow-lg">
                <div className="mb-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-cyan-400 shadow-lg shadow-cyan-400/50"></div>
                    <span className="text-cyan-400 font-semibold text-sm">Your Location</span>
                  </div>
                  {hasUserLocation && (
                    <p className="text-slate-300 text-xs ml-6">
                      {userLocation.latitude.toFixed(4)}, {userLocation.longitude.toFixed(4)}
                    </p>
                  )}
                </div>

                <div className="border-t border-slate-700 pt-3">
                  <div className="flex items-center gap-2 mb-2">
                    <div className="w-4 h-4 rounded-full bg-red-400 shadow-lg shadow-red-400/50"></div>
                    <span className="text-red-400 font-semibold text-sm">Blood Banks/Hospitals</span>
                  </div>
                  <p className="text-slate-300 text-xs ml-6">
                    {providerMarkers.length} mapped / {nearbyProviders.length} total
                  </p>
                </div>
              </div>
            </div>

            {/* Providers List Below Map */}
            {nearbyProviders.length > 0 && (
              <div className="p-6 border-t border-slate-700 bg-slate-800/30">
                <h3 className="text-sm font-semibold text-slate-200 mb-3">Providers on Map</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                  {nearbyProviders.map((provider, idx) => (
                    <div key={provider._id} className="flex items-center gap-2 text-xs">
                      <div className="w-2 h-2 rounded-full bg-red-400 flex-shrink-0"></div>
                      <span className="text-slate-300 truncate">{provider.organizationName}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (user?.role === "provider") {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 p-6">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-2">Blood Bank Management</h1>
            <p className="text-slate-400">Manage your blood inventory and facility information</p>
          </div>

          {/* Action Buttons */}
          {!myProviderEntry ? (
            <button
              onClick={() => setShowCreateForm(!showCreateForm)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 font-semibold transition"
            >
              <Plus className="w-5 h-5" />
              Create New Entry
            </button>
          ) : (
            <button
              onClick={() => setShowUpdateForm(!showUpdateForm)}
              className="mb-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600 text-white rounded-lg flex items-center gap-2 font-semibold transition"
            >
              <Edit className="w-5 h-5" />
              Update Inventory
            </button>
          )}

          {/* Create Form */}
          {showCreateForm && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-4">Create New Entry</h2>
              <form onSubmit={handleCreateSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Organization Name</label>
                    <input
                      type="text"
                      value={formData.organizationName}
                      onChange={(e) => setFormData({ ...formData, organizationName: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Your organization name"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Phone</label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Contact number"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Address</label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Full address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-200 mb-2">Email</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Contact email"
                    />
                  </div>
                </div>

                {/* Location Fields */}
                <div className="bg-slate-700/30 border border-slate-600 rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <label className="block text-sm font-medium text-slate-200">Location</label>
                    <button
                      type="button"
                      onClick={getLocation}
                      className="px-3 py-1 bg-cyan-600 hover:bg-cyan-700 text-white text-sm rounded-lg flex items-center gap-1 transition"
                    >
                      <Navigation className="w-4 h-4" />
                      Get Location
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.latitude}
                      onChange={(e) => setFormData({ ...formData, latitude: e.target.value })}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Latitude"
                      required
                    />
                    <input
                      type="number"
                      step="0.0001"
                      value={formData.longitude}
                      onChange={(e) => setFormData({ ...formData, longitude: e.target.value })}
                      className="px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                      placeholder="Longitude"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-4">
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                  >
                    Create Entry
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCreateForm(false)}
                    className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Current Entry Display */}
          {myProviderEntry && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 mb-6 backdrop-blur">
              <h2 className="text-xl font-bold text-white mb-4">Your Entry</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div>
                  <p className="text-slate-400 text-sm">Organization Name</p>
                  <p className="text-white font-semibold">{myProviderEntry.organizationName}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Address</p>
                  <p className="text-white font-semibold">{myProviderEntry.address}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Phone</p>
                  <p className="text-white font-semibold">{myProviderEntry.phone || "N/A"}</p>
                </div>
                <div>
                  <p className="text-slate-400 text-sm">Email</p>
                  <p className="text-white font-semibold">{myProviderEntry.email || "N/A"}</p>
                </div>
              </div>
            </div>
          )}

          {/* Inventory Management */}
          {myProviderEntry && (
            <div className="bg-slate-800/50 border border-slate-700 rounded-lg p-6 backdrop-blur">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Droplet className="w-5 h-5 text-red-400" />
                  Blood Inventory
                </h2>
                {!showUpdateForm && (
                  <button
                    onClick={() => setShowUpdateForm(true)}
                    className="px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded-lg transition"
                  >
                    Edit
                  </button>
                )}
              </div>

              {showUpdateForm ? (
                <form onSubmit={handleUpdateInventory} className="space-y-4">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {bloodTypes.map((type) => (
                      <div key={type}>
                        <label className="block text-sm font-medium text-slate-200 mb-2">{type}</label>
                        <input
                          type="number"
                          min="0"
                          value={inventoryData[type]}
                          onChange={(e) =>
                            setInventoryData({ ...inventoryData, [type]: Number.parseInt(e.target.value) || 0 })
                          }
                          className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white text-center focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                        />
                      </div>
                    ))}
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="submit"
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowUpdateForm(false)}
                      className="flex-1 bg-slate-700 hover:bg-slate-600 text-white py-2 rounded-lg font-medium transition"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {bloodTypes.map((type) => (
                    <div key={type} className="bg-slate-700/50 rounded-lg p-4 text-center border border-slate-600">
                      <p className="text-slate-400 text-sm mb-2">{type}</p>
                      <p className="text-2xl font-bold text-cyan-400">{myProviderEntry.bloodInventory[type]}</p>
                      <p className="text-slate-500 text-xs mt-1">units</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    )
  }

  // Default loading view
  return (
    <div className="flex items-center justify-center h-screen text-white">
      <p>Loading...</p>
    </div>
  )
}
