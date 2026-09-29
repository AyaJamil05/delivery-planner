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

interface DeliveryDistance {
  deliveryId: number
  distance: number
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
  const [distances, setDistances] = useState<DeliveryDistance[]>([])

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

      fetch(
        `http://localhost:8080/api/distance` +
        `?lat1=${delivery.driver.latitude}` +
        `&lon1=${delivery.driver.longitude}` +
        `&lat2=${delivery.latitude}` +
        `&lon2=${delivery.longitude}`
      )
        .then(response => response.json())
        .then(distance => {

          setDistances(prev => {

            const existing = prev.find(
              item => item.deliveryId === delivery.id
            )

            if (existing) {
              return prev.map(item =>
                item.deliveryId === delivery.id
                  ? { deliveryId: delivery.id, distance }
                  : item
              )
            }

            return [
              ...prev,
              {
                deliveryId: delivery.id,
                distance
              }
            ]
          })

        })
        .catch(error => {
          console.error(
            'Erreur lors du calcul de la distance :',
            error
          )
        })

    })

  }, [deliveries])

  const assignedCount = deliveries.filter(delivery => delivery.driver !== null).length
  const pendingCount = deliveries.length - assignedCount

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
                  <div className="chart-label-row"><span>Affectées</span><strong>{assignedCount}</strong></div>
                  <div className="bar-track"><div className="bar-fill assigned-bar" style={{ width: `${deliveries.length ? (assignedCount / deliveries.length) * 100 : 0}%` }} /></div>
                  <div className="chart-label-row"><span>En attente</span><strong>{pendingCount}</strong></div>
                  <div className="bar-track"><div className="bar-fill pending-bar" style={{ width: `${deliveries.length ? (pendingCount / deliveries.length) * 100 : 0}%` }} /></div>
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
                  <Marker key={`driver-${driver.id}`} position={[driver.latitude, driver.longitude]} icon={driverIcon}>
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
                      Statut : {delivery.status ?? 'PENDING'}<br />
                      Livreur : {delivery.driver ? delivery.driver.name : 'Aucun'}
                    </Popup>
                  </Marker>
                )
              })}

              {deliveries.map(delivery => {
                if (
                  delivery.driver === null ||
                  delivery.latitude === null ||
                  delivery.longitude === null ||
                  delivery.driver.latitude === null ||
                  delivery.driver.longitude === null
                ) return null

                return (
                  <Polyline
                    key={`line-${delivery.id}`}
                    positions={[
                      [delivery.driver.latitude, delivery.driver.longitude],
                      [delivery.latitude, delivery.longitude]
                    ]}
                  />
                )
              })}
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
                  <th>Livreur</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {deliveries.map(delivery => {
                  const distance = distances.find(item => item.deliveryId === delivery.id)
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
                        {delivery.driver ? (distance ? `${distance.distance.toFixed(2)} km` : 'Calcul...') : '—'}
                      </td>
                      <td>{delivery.driver ? delivery.driver.name : <span className="muted">Aucun</span>}</td>
                      <td>
                        <span className={delivery.status === 'ASSIGNED' ? 'status assigned' : 'status pending'}>
                          {delivery.status ?? 'PENDING'}
                        </span>
                      </td>
                      <td>
                        <div className="table-actions">
                          <button className="icon-button edit-icon" title="Modifier" onClick={() => setEditingDelivery(delivery)}>✎</button>
                          <button className="icon-button delete-icon" title="Supprimer" onClick={() => deleteDelivery(delivery.id)}>×</button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
                {deliveries.length === 0 && (
                  <tr><td colSpan={8} className="empty-row">Aucune livraison pour le moment.</td></tr>
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
          <div className="panel-title">
            <div><h2>Gestion des livreurs</h2></div>
          </div>
          <div className="table-wrapper">
            <table className="deliveries-table drivers-table">
              <thead><tr><th>ID</th><th>Livreur</th><th>Coordonnées</th><th>Livraisons</th><th>Charge</th><th>Disponibilité</th></tr></thead>
              <tbody>
                {drivers.map(driver => {
                  const numberOfDeliveries = deliveries.filter(delivery => delivery.driver?.id === driver.id).length
                  const maxLoad = Math.max(deliveries.length, 1)
                  const loadPercent = Math.min((numberOfDeliveries / maxLoad) * 100, 100)
                  return <tr key={driver.id}>
                    <td className="id-cell">#{driver.id}</td>
                    <td><strong>{driver.name}</strong></td>
                    <td className="coordinates">{driver.latitude !== null && driver.longitude !== null ? `${driver.latitude.toFixed(4)}, ${driver.longitude.toFixed(4)}` : '—'}</td>
                    <td>{numberOfDeliveries}</td>
                    <td><div className="table-load"><div className="load-track"><div className="load-fill" style={{ width: `${loadPercent}%` }} /></div><span>{numberOfDeliveries}</span></div></td>
                    <td><span className="available">Disponible</span></td>
                  </tr>
                })}
                {drivers.length === 0 && <tr><td colSpan={6} className="empty-row">Aucun livreur pour le moment.</td></tr>}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  )
}
export default App