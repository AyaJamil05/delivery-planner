import { useEffect, useState } from 'react'
import './App.css'
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  Polyline
} from 'react-leaflet'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

interface Driver {
  id: number
  name: string
  latitude: number | null
  longitude: number | null
}

interface Delivery {
  id: number
  client: string
  address: string
  latitude: number | null
  longitude: number | null
  status: string | null
  driver: Driver | null
}

interface Route {
  deliveryId: number
  positions: [number, number][]
  distance: number
  duration: number
}

const driverIcon = L.divIcon({
  className: 'custom-map-icon',
  html: '<div class="map-marker driver-marker"><span>●</span></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
})

const deliveryIcon = L.divIcon({
  className: 'custom-map-icon',
  html: '<div class="map-marker delivery-marker"><span>●</span></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 30],
  popupAnchor: [0, -30]
})

function App() {

  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [isAssigning, setIsAssigning] = useState(false)

  const [client, setClient] = useState('')
  const [address, setAddress] = useState('')
  const [latitude, setLatitude] = useState('')
  const [longitude, setLongitude] = useState('')

  const [isAdding, setIsAdding] = useState(false)
  const [editingDelivery, setEditingDelivery] = useState<Delivery | null>(null)
  const [isUpdating, setIsUpdating] = useState(false)
  const [routes, setRoutes] = useState<Route[]>([])

  const [driverName, setDriverName] = useState('')
  const [driverLatitude, setDriverLatitude] = useState('')
  const [driverLongitude, setDriverLongitude] = useState('')
  const [isAddingDriver, setIsAddingDriver] = useState(false)

  const [editingDriver, setEditingDriver] = useState<Driver | null>(null)
  const [isUpdatingDriver, setIsUpdatingDriver] = useState(false)

  const [simulatingDeliveryId, setSimulatingDeliveryId] = useState<number | null>(null)
  const [simulatedPositions, setSimulatedPositions] = useState<Record<number, [number, number]>>({})

  const assignAllDeliveries = () => {

      setIsAssigning(true)

      fetch('http://localhost:8080/api/deliveries/assign-all', {
        method: 'POST'
      })
        .then(response => response.json())
        .then(() => {

          return fetch('http://localhost:8080/api/deliveries')

        })
        .then(response => response.json())
        .then(data => {

          setDeliveries(data)

        })
        .catch(error => {

          console.error(
            'Erreur lors de l’affectation des livraisons :',
            error
          )

        })
        .finally(() => {

          setIsAssigning(false)

        })
    }

    const addDelivery = () => {

      if (!client || !address || !latitude || !longitude) {
        alert('Veuillez remplir tous les champs')
        return
      }

      setIsAdding(true)

      const newDelivery = {
        client: client,
        address: address,
        latitude: Number(latitude),
        longitude: Number(longitude)
      }

      fetch('http://localhost:8080/api/deliveries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDelivery)
      })
        .then(response => response.json())
        .then(data => {

          setDeliveries(prev => [...prev, data])

          setClient('')
          setAddress('')
          setLatitude('')
          setLongitude('')

        })
        .catch(error => {
          console.error(
            'Erreur lors de l’ajout de la livraison :',
            error
          )
        })
        .finally(() => {
          setIsAdding(false)
        })
    }

    const updateDelivery = () => {

      if (!editingDelivery) {
        return
      }

      if (
        !editingDelivery.client ||
        !editingDelivery.address ||
        editingDelivery.latitude === null ||
        editingDelivery.longitude === null
      ) {
        alert('Veuillez remplir tous les champs')
        return
      }

      setIsUpdating(true)

      fetch(`http://localhost:8080/api/deliveries/${editingDelivery.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          client: editingDelivery.client,
          address: editingDelivery.address,
          latitude: editingDelivery.latitude,
          longitude: editingDelivery.longitude
        })
      })
        .then(response => response.json())
        .then(data => {

          setDeliveries(prev =>
            prev.map(delivery =>
              delivery.id === data.id ? data : delivery
            )
          )

          setEditingDelivery(null)
        })
        .catch(error => {
          console.error(
            'Erreur lors de la modification de la livraison :',
            error
          )
        })
        .finally(() => {
          setIsUpdating(false)
        })
    }

    const deleteDelivery = (id: number) => {

      const confirmed = window.confirm(
        'Voulez-vous vraiment supprimer cette livraison ?'
      )

      if (!confirmed) {
        return
      }

      fetch(`http://localhost:8080/api/deliveries/${id}`, {
        method: 'DELETE'
      })
        .then(() => {
          setDeliveries(prev =>
            prev.filter(delivery => delivery.id !== id)
          )
        })
        .catch(error => {
          console.error(
            'Erreur lors de la suppression de la livraison :',
            error
          )
        })
    }

    const addDriver = () => {
      if (!driverName || !driverLatitude || !driverLongitude) {
        alert('Veuillez remplir tous les champs')
        return
      }

      setIsAddingDriver(true)

      const newDriver = {
        name: driverName,
        latitude: Number(driverLatitude),
        longitude: Number(driverLongitude)
      }

      fetch('http://localhost:8080/api/drivers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newDriver)
      })
        .then(response => response.json())
        .then(data => {
          setDrivers(prev => [...prev, data])

          setDriverName('')
          setDriverLatitude('')
          setDriverLongitude('')
        })
        .catch(error => {
          console.error('Erreur lors de l’ajout du livreur :', error)
        })
        .finally(() => {
          setIsAddingDriver(false)
        })
    }

    const updateDriver = () => {
      if (!editingDriver) {
        return
      }

      if (
        !editingDriver.name ||
        editingDriver.latitude === null ||
        editingDriver.longitude === null
      ) {
        alert('Veuillez remplir tous les champs')
        return
      }

      setIsUpdatingDriver(true)

      fetch(`http://localhost:8080/api/drivers/${editingDriver.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: editingDriver.name,
          latitude: editingDriver.latitude,
          longitude: editingDriver.longitude
        })
      })
        .then(response => response.json())
        .then(data => {
          setDrivers(prev =>
            prev.map(driver =>
              driver.id === data.id ? data : driver
            )
          )

          setEditingDriver(null)
        })
        .catch(error => {
          console.error(
            'Erreur lors de la modification du livreur :',
            error
          )
        })
        .finally(() => {
          setIsUpdatingDriver(false)
        })
    }

    const deleteDriver = (id: number) => {

      const confirmed = window.confirm(
        'Voulez-vous vraiment supprimer ce livreur ?'
      )

      if (!confirmed) {
        return
      }

      fetch(`http://localhost:8080/api/drivers/${id}`, {
        method: 'DELETE'
      })
        .then(async response => {

          if (!response.ok) {
            const message = await response.text()
            throw new Error(message)
          }

          setDrivers(prev =>
            prev.filter(driver => driver.id !== id)
          )
        })
        .catch(error => {
          alert(error.message)
          console.error(
            'Erreur lors de la suppression du livreur :',
            error
          )
        })
    }

    const updateStatus = (id: number, status: string) => {

      fetch(`http://localhost:8080/api/deliveries/${id}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          status: status
        })
      })
        .then(response => {
          if (!response.ok) {
            throw new Error('Erreur lors de la modification du statut')
          }

          return response.json()
        })
        .then(data => {

          setDeliveries(prev =>
            prev.map(delivery =>
              delivery.id === data.id ? data : delivery
            )
          )

        })
        .catch(error => {
          alert(error.message)
          console.error(error)
        })
    }

    const simulateDelivery = (deliveryId: number) => {

      const route = routes.find(
        route => route.deliveryId === deliveryId
      )

      const delivery = deliveries.find(
        delivery => delivery.id === deliveryId
      )

      if (!route || route.positions.length === 0 || !delivery?.driver) {
        alert('Aucun trajet disponible pour cette livraison')
        return
      }

      const driverId = delivery.driver.id

      setSimulatingDeliveryId(deliveryId)

      let currentPosition = 0

      const step = Math.max(
        1,
        Math.floor(route.positions.length / 30)
      )

      const interval = setInterval(() => {

        currentPosition += step

        if (currentPosition >= route.positions.length) {

          clearInterval(interval)

          const finalPosition =
            route.positions[route.positions.length - 1]

          setSimulatedPositions(prev => ({
            ...prev,
            [driverId]: finalPosition
          }))

          fetch(`http://localhost:8080/api/drivers/${driverId}/location`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              latitude: finalPosition[0],
              longitude: finalPosition[1]
            })
          })
            .then(response => {
              if (!response.ok) {
                throw new Error('Erreur lors de la mise à jour finale')
              }

              return response.json()
            })
            .catch(error => {
              console.error(error)
            })

          setSimulatingDeliveryId(null)

          updateStatus(deliveryId, 'DELIVERED')

          return
        }

        currentPosition = Math.min(
          currentPosition,
          route.positions.length - 1
        )
        const position = route.positions[currentPosition]

        setSimulatedPositions(prev => ({
          ...prev,
          [driverId]: position
        }))

        fetch(`http://localhost:8080/api/drivers/${driverId}/location`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            latitude: position[0],
            longitude: position[1]
          })
        })
          .then(response => {
            if (!response.ok) {
              throw new Error('Erreur lors de la mise à jour de la position')
            }

            return response.json()
          })
          .catch(error => {
            console.error(error)
          })

      }, 500)
    }

    const fetchRoute = (
      deliveryId: number,
      driverLatitude: number,
      driverLongitude: number,
      deliveryLatitude: number,
      deliveryLongitude: number
    ) => {

      const url =
        `https://router.project-osrm.org/route/v1/driving/` +
        `${driverLongitude},${driverLatitude};` +
        `${deliveryLongitude},${deliveryLatitude}` +
        `?overview=full&geometries=geojson`

      fetch(url)
        .then(response => response.json())
        .then(data => {

          if (!data.routes || data.routes.length === 0) {
            return
          }

          const coordinates = data.routes[0].geometry.coordinates

          const positions: [number, number][] = coordinates.map(
            (coordinate: [number, number]) => [
              coordinate[1],
              coordinate[0]
            ]
          )

          const distance = data.routes[0].distance
          const duration = data.routes[0].duration

          setRoutes(prev => {

            const existing = prev.find(
              route => route.deliveryId === deliveryId
            )

            if (existing) {
              return prev.map(route =>
                route.deliveryId === deliveryId
                  ? {
                      deliveryId,
                      positions,
                      distance,
                      duration
                    }
                  : route
              )
            }

            return [
              ...prev,
              {
                deliveryId,
                positions,
                distance,
                duration
              }
            ]
          })
        })
        .catch(error => {
          console.error(
            'Erreur lors du calcul du trajet :',
            error
          )
        })
    }

  useEffect(() => {

    fetch('http://localhost:8080/api/deliveries')
      .then(response => response.json())
      .then(data => {
        setDeliveries(data)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des livraisons :', error)
      })

    fetch('http://localhost:8080/api/drivers')
      .then(response => response.json())
      .then(data => {
        setDrivers(data)
      })
      .catch(error => {
        console.error('Erreur lors du chargement des livreurs :', error)
      })

  }, [])

  useEffect(() => {

    deliveries.forEach(delivery => {

      if (
        delivery.driver === null ||
        delivery.latitude === null ||
        delivery.longitude === null ||
        delivery.driver.latitude === null ||
        delivery.driver.longitude === null
      ) {
        return
      }

      fetchRoute(
        delivery.id,
        delivery.driver.latitude,
        delivery.driver.longitude,
        delivery.latitude,
        delivery.longitude
      )
    })

  }, [deliveries])

  const normalizeStatus = (status: string | null) => {
    if (!status || status.trim() === '') {
      return 'PENDING'
    }

    return status.trim().toUpperCase()
  }

  const formatDuration = (seconds: number) => {
    const minutes = Math.round(seconds / 60)

    if (minutes < 60) {
      return `${minutes} min`
    }

    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60

    return remainingMinutes === 0
      ? `${hours} h`
      : `${hours} h ${remainingMinutes} min`
  }

  const pendingCount = deliveries.filter(
    delivery => normalizeStatus(delivery.status) === 'PENDING'
  ).length

  const assignedCount = deliveries.filter(
    delivery => normalizeStatus(delivery.status) === 'ASSIGNED'
  ).length

  const inProgressCount = deliveries.filter(
    delivery => normalizeStatus(delivery.status) === 'IN_PROGRESS'
  ).length

  const deliveredCount = deliveries.filter(
    delivery => normalizeStatus(delivery.status) === 'DELIVERED'
  ).length

  const getStatusClass = (status: string | null) => {
    switch (normalizeStatus(status)) {
      case 'ASSIGNED':
        return 'status assigned'

      case 'IN_PROGRESS':
        return 'status in-progress'

      case 'DELIVERED':
        return 'status delivered'

      case 'PENDING':
      default:
        return 'status pending'
    }
  }

  const getStatusLabel = (status: string | null) => {
    switch (normalizeStatus(status)) {
      case 'ASSIGNED':
        return 'Affectée'

      case 'IN_PROGRESS':
        return 'En cours'

      case 'DELIVERED':
        return 'Livrée'

      case 'PENDING':
      default:
        return 'En attente'
    }
  }
  
  return (
    <div className="app">
      <header className="header">
        <div className="header-content">
          <div>
            <h1>Delivery Planner</h1>
          </div>
          <nav className="top-nav">
            <a href="#dashboard">Tableau de bord</a>
            <a href="#livraisons">Livraisons</a>
            <a href="#chauffeurs">Livreurs</a>
          </nav>
        </div>
      </header>

      <main className="main-content">
        <section id="dashboard" className="top-section">
          <div className="left-column">
            <section className="stats-grid">
              <div className="stat-card"><div>
                <span className="stat-label">Livraisons</span>
                <strong>{deliveries.length}</strong></div>
              </div>
              <div className="stat-card"><div>
                <span className="stat-label">Livreurs</span>
                <strong>{drivers.length}</strong></div>
              </div>
            </section>

            <section className="panel analytics-panel">
              <div className="panel-title">
                <div><h2>Activité des livraisons</h2></div>
              </div>
              <div className="analytics-content">
                <div className="chart-block">

                  <div className="chart-label-row">
                    <span>En attente</span>
                    <strong>{pendingCount}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill pending-bar"
                      style={{
                        width: `${deliveries.length
                          ? (pendingCount / deliveries.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>


                  <div className="chart-label-row">
                    <span>Affectées</span>
                    <strong>{assignedCount}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill assigned-bar"
                      style={{
                        width: `${deliveries.length
                          ? (assignedCount / deliveries.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>


                  <div className="chart-label-row">
                    <span>En cours</span>
                    <strong>{inProgressCount}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill in-progress-bar"
                      style={{
                        width: `${deliveries.length
                          ? (inProgressCount / deliveries.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>


                  <div className="chart-label-row">
                    <span>Livrées</span>
                    <strong>{deliveredCount}</strong>
                  </div>

                  <div className="bar-track">
                    <div
                      className="bar-fill delivered-bar"
                      style={{
                        width: `${deliveries.length
                          ? (deliveredCount / deliveries.length) * 100
                          : 0}%`
                      }}
                    />
                  </div>

                </div>
                
              </div>
            </section>

            <section className="panel create-panel">
              <div className="panel-title">
                <div>
                  <h2>Nouvelle livraison</h2>
                </div>
              </div>

              <div className="delivery-form">
                <input type="text" placeholder="Client" value={client}
                  onChange={event => setClient(event.target.value)} />
                <input type="text" placeholder="Adresse" value={address}
                  onChange={event => setAddress(event.target.value)} />
                <input type="number" step="any" placeholder="Latitude" value={latitude}
                  onChange={event => setLatitude(event.target.value)} />
                <input type="number" step="any" placeholder="Longitude" value={longitude}
                  onChange={event => setLongitude(event.target.value)} />
              </div>

              <div className="form-actions">
                <button className="primary-button" onClick={addDelivery} disabled={isAdding}>
                  {isAdding ? 'Ajout...' : 'Ajouter la livraison'}
                </button>
              </div>
            </section>
          </div>

          <section className="panel map-panel">
            <div className="panel-title map-title">
              <div>
                <h2>Carte</h2>
              </div>
              <div className="map-legend">
                <span><span className="legend-dot driver-dot"></span>Livreurs</span>
                <span><span className="legend-dot delivery-dot"></span> Livraisons</span>
              </div>
            </div>

            <MapContainer
              center={[48.4000, -4.4850]}
              zoom={13}
              className="delivery-map"
            >
              <TileLayer
                attribution='&copy; OpenStreetMap contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />

              {drivers.map(driver => {
                if (driver.latitude === null || driver.longitude === null) return null
                return (
                  <Marker
                    key={`driver-${driver.id}`}
                    position={
                      simulatedPositions[driver.id] ??
                      [driver.latitude, driver.longitude]
                    }
                    icon={driverIcon}
                  >
                    <Popup><strong>Livreur : {driver.name}</strong></Popup>
                  </Marker>
                )
              })}

              {deliveries.map(delivery => {
                if (delivery.latitude === null || delivery.longitude === null) return null
                return (
                  <Marker key={`delivery-${delivery.id}`} position={[delivery.latitude, delivery.longitude]} icon={deliveryIcon}>
                  <Popup>
                    <strong>{delivery.client}</strong><br />
                    {delivery.address}<br />

                    Statut : {getStatusLabel(delivery.status)}<br />

                    Livreur : {delivery.driver
                      ? delivery.driver.name
                      : 'Aucun'}<br />

                    {(() => {
                      const route = routes.find(
                        item => item.deliveryId === delivery.id
                      )

                      if (!route) {
                        return null
                      }

                      return (
                        <>
                          Distance : {(route.distance / 1000).toFixed(2)} km<br />
                          Durée estimée : {formatDuration(route.duration)}
                        </>
                      )
                    })()}
                  </Popup>
                  </Marker>
                )
              })}

              {routes.map(route => (
                <Polyline
                  key={`route-${route.deliveryId}`}
                  positions={route.positions}
                />
              ))}
            </MapContainer>
          </section>
        </section>

        <section id="livraisons" className="panel deliveries-panel">
          <div className="panel-title panel-title-between">
            <div><h2>Livraisons</h2></div>
            <button className="secondary-button" onClick={assignAllDeliveries} disabled={isAssigning}>
              {isAssigning ? 'Affectation...' : 'Affecter automatiquement'}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="deliveries-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Client</th>
                  <th>Adresse</th>
                  <th>Coordonnées</th>
                  <th>Distance</th>
                  <th>Durée</th>
                  <th>Livreur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(delivery => {
                  const route = routes.find(
                    item => item.deliveryId === delivery.id
                  )
                  return (
                    <tr key={delivery.id}>
                      <td className="id-cell">#{delivery.id}</td>
                      <td><strong>{delivery.client}</strong></td>
                      <td>{delivery.address}</td>
                      <td className="coordinates">
                        {delivery.latitude !== null && delivery.longitude !== null
                          ? `${delivery.latitude.toFixed(4)}, ${delivery.longitude.toFixed(4)}`
                          : '—'}
                      </td>
                      <td className="distance-cell">
                        {delivery.driver
                          ? route
                            ? `${(route.distance / 1000).toFixed(2)} km`
                            : 'Calcul...'
                          : '—'}
                      </td>
                      <td className="distance-cell">
                        {delivery.driver
                          ? route
                            ? `${formatDuration(route.duration)}`
                            : 'Calcul...'
                          : '—'}
                      </td>
                      <td>{delivery.driver ? delivery.driver.name : <span className="muted">Aucun</span>}</td>
                      <td>
                        <span className={getStatusClass(delivery.status)}>
                          {getStatusLabel(delivery.status)}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          {normalizeStatus(delivery.status) === 'ASSIGNED' && (
                            <button
                              className="secondary-button"
                              onClick={() => updateStatus(delivery.id, 'IN_PROGRESS')}
                            >
                              Démarrer
                            </button>
                          )}

                          {normalizeStatus(delivery.status) === 'IN_PROGRESS' && (
                            <button
                              className="secondary-button"
                              onClick={() => simulateDelivery(delivery.id)}
                              disabled={simulatingDeliveryId === delivery.id}
                            >
                              {simulatingDeliveryId === delivery.id
                                ? 'Simulation...'
                                : 'Simuler'}
                            </button>
                          )}

                          {normalizeStatus(delivery.status) === 'IN_PROGRESS' && (
                            <button
                              className="primary-button"
                              onClick={() => updateStatus(delivery.id, 'DELIVERED')}
                            >
                              Livrée
                            </button>
                          )}
                          <button className="icon-button edit-icon" title="Modifier" onClick={() => setEditingDelivery(delivery)}>✎</button>
                          <button className="icon-button delete-icon" title="Supprimer" onClick={() => deleteDelivery(delivery.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {deliveries.length === 0 && (
                  <tr><td colSpan={9} className="empty-row">Aucune livraison pour le moment.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {editingDelivery && (
          <div className="modal-overlay" onClick={() => setEditingDelivery(null)}>
            <section className="edit-modal" onClick={event => event.stopPropagation()}>
              <div className="modal-header">
                <div>
                  <h2>Modifier la livraison</h2>
                  <p>Livraison #{editingDelivery.id}</p>
                </div>
                <button className="close-button" onClick={() => setEditingDelivery(null)}>×</button>
              </div>

              <div className="delivery-form">
                <input type="text" placeholder="Client" value={editingDelivery.client}
                  onChange={event => setEditingDelivery({...editingDelivery, client: event.target.value})} />
                <input type="text" placeholder="Adresse" value={editingDelivery.address}
                  onChange={event => setEditingDelivery({...editingDelivery, address: event.target.value})} />
                <input type="number" step="any" placeholder="Latitude" value={editingDelivery.latitude ?? ''}
                  onChange={event => setEditingDelivery({...editingDelivery, latitude: Number(event.target.value)})} />
                <input type="number" step="any" placeholder="Longitude" value={editingDelivery.longitude ?? ''}
                  onChange={event => setEditingDelivery({...editingDelivery, longitude: Number(event.target.value)})} />
              </div>

              <div className="form-actions">
                <button className="secondary-button" onClick={() => setEditingDelivery(null)}>Annuler</button>
                <button className="primary-button" onClick={updateDelivery} disabled={isUpdating}>
                  {isUpdating ? 'Modification...' : 'Enregistrer'}
                </button>
              </div>
            </section>
          </div>
        )}

        <section id="chauffeurs" className="panel drivers-panel">

          <div className="panel-title drivers-title">
            <div>
              <h2>Livreurs</h2>
            </div>
          </div>

          <div className="driver-form">
            <input
              type="text"
              placeholder="Nom du livreur"
              value={driverName}
              onChange={event => setDriverName(event.target.value)}
            />

            <input
              type="number"
              step="any"
              placeholder="Latitude"
              value={driverLatitude}
              onChange={event => setDriverLatitude(event.target.value)}
            />

            <input
              type="number"
              step="any"
              placeholder="Longitude"
              value={driverLongitude}
              onChange={event => setDriverLongitude(event.target.value)}
            />

            <button
              className="primary-button"
              onClick={addDriver}
              disabled={isAddingDriver}
            >
              {isAddingDriver ? 'Ajout...' : 'Ajouter le livreur'}
            </button>
          </div>

          <div className="table-wrapper">
            <table className="deliveries-table drivers-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Livreur</th>
                  <th>Coordonnées</th>
                  <th>Livraisons</th>
                  <th>Disponibilité</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {drivers.map(driver => {
                  const numberOfDeliveries = deliveries.filter(
                    delivery => delivery.driver?.id === driver.id
                  ).length

                  return (
                    <tr key={driver.id}>
                      <td className="id-cell">
                        #{driver.id}
                      </td>

                      <td>
                        <strong>{driver.name}</strong>
                      </td>

                      <td className="coordinates">
                        {driver.latitude !== null && driver.longitude !== null
                          ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}`
                          : '—'}
                      </td>

                      <td>
                        {numberOfDeliveries}
                      </td>

                      <td>
                        <span className="available">
                          Disponible
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="icon-button edit-icon"
                            title="Modifier"
                            onClick={() => setEditingDriver(driver)}
                          >
                            ✎
                          </button>

                          <button
                            className="icon-button delete-icon"
                            title="Supprimer"
                            onClick={() => deleteDriver(driver.id)}
                          >
                            ×
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })}

                {drivers.length === 0 && (
                  <tr>
                    <td colSpan={5} className="empty-row">
                      Aucun livreur pour le moment.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

        </section>
        {editingDriver && (
          <div
            className="modal-overlay"
            onClick={() => setEditingDriver(null)}
          >
            <section
              className="edit-modal"
              onClick={event => event.stopPropagation()}
            >
              <div className="modal-header">
                <div>
                  <h2>Modifier le livreur</h2>
                  <p>Livreur #{editingDriver.id}</p>
                </div>

                <button
                  className="close-button"
                  onClick={() => setEditingDriver(null)}
                >
                  ×
                </button>
              </div>

              <div className="delivery-form">

                <input
                  type="text"
                  placeholder="Nom du livreur"
                  value={editingDriver.name}
                  onChange={event =>
                    setEditingDriver({
                      ...editingDriver,
                      name: event.target.value
                    })
                  }
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={editingDriver.latitude ?? ''}
                  onChange={event =>
                    setEditingDriver({
                      ...editingDriver,
                      latitude: Number(event.target.value)
                    })
                  }
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={editingDriver.longitude ?? ''}
                  onChange={event =>
                    setEditingDriver({
                      ...editingDriver,
                      longitude: Number(event.target.value)
                    })
                  }
                />

              </div>

              <div className="form-actions">

                <button
                  className="secondary-button"
                  onClick={() => setEditingDriver(null)}
                >
                  Annuler
                </button>

                <button
                  className="primary-button"
                  onClick={updateDriver}
                  disabled={isUpdatingDriver}
                >
                  {isUpdatingDriver ? 'Modification...' : 'Enregistrer'}
                </button>

              </div>
            </section>
          </div>
        )}
      </main>
          </div>
        )
}
export default App