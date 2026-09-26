import { useEffect, useState } from 'react'
import './App.css'

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
        console.error('Erreur lors du chargement des chauffeurs :', error)
      })

  }, [])

  return (
    <div className="app">

      <header className="header">
        <h1>Delivery Planner</h1>
        <p>Gestion et planification des livraisons</p>
      </header>

      <main className="dashboard">

      <section className="card add-delivery-card">

        <div className="card-header">
          <h2>Nouvelle livraison</h2>
        </div>

        <div className="delivery-form">

          <input
            type="text"
            placeholder="Client"
            value={client}
            onChange={event => setClient(event.target.value)}
          />

          <input
            type="text"
            placeholder="Adresse"
            value={address}
            onChange={event => setAddress(event.target.value)}
          />

          <input
            type="number"
            step="any"
            placeholder="Latitude"
            value={latitude}
            onChange={event => setLatitude(event.target.value)}
          />

          <input
            type="number"
            step="any"
            placeholder="Longitude"
            value={longitude}
            onChange={event => setLongitude(event.target.value)}
          />

          <button
            className="add-button"
            onClick={addDelivery}
            disabled={isAdding}
          >
            {isAdding ? 'Ajout en cours...' : 'Ajouter la livraison'}
          </button>

        </div>

      </section>

        <div className="action-bar">

          <button
            className="assign-button"
            onClick={assignAllDeliveries}
            disabled={isAssigning}
          >
            {isAssigning
              ? 'Affectation en cours...'
              : 'Affecter les livraisons automatiquement'}
          </button>

        </div>

          {editingDelivery && (

            <section className="card edit-delivery-card">

              <div className="card-header">
                <h2>Modifier la livraison</h2>
              </div>

              <div className="delivery-form">

                <input
                  type="text"
                  placeholder="Client"
                  value={editingDelivery.client}
                  onChange={event =>
                    setEditingDelivery({
                      ...editingDelivery,
                      client: event.target.value
                    })
                  }
                />

                <input
                  type="text"
                  placeholder="Adresse"
                  value={editingDelivery.address}
                  onChange={event =>
                    setEditingDelivery({
                      ...editingDelivery,
                      address: event.target.value
                    })
                  }
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Latitude"
                  value={editingDelivery.latitude ?? ''}
                  onChange={event =>
                    setEditingDelivery({
                      ...editingDelivery,
                      latitude: Number(event.target.value)
                    })
                  }
                />

                <input
                  type="number"
                  step="any"
                  placeholder="Longitude"
                  value={editingDelivery.longitude ?? ''}
                  onChange={event =>
                    setEditingDelivery({
                      ...editingDelivery,
                      longitude: Number(event.target.value)
                    })
                  }
                />

                <button
                  className="add-button"
                  onClick={updateDelivery}
                  disabled={isUpdating}
                >
                  {isUpdating ? 'Modification...' : 'Enregistrer les modifications'}
                </button>

                <button
                  className="cancel-button"
                  onClick={() => setEditingDelivery(null)}
                >
                  Annuler
                </button>

              </div>

            </section>

          )}
        {/* LIVRAISONS */}

        <section className="card">

          <div className="card-header">
            <h2>Livraisons</h2>

            <span className="badge">
              {deliveries.length}
            </span>
          </div>

          {deliveries.map(delivery => (

            <div className="delivery" key={delivery.id}>

              <div>
                <strong>{delivery.client}</strong>
                <p>{delivery.address}</p>
              </div>

              <div>

                <span className={
                  delivery.status === 'ASSIGNED'
                    ? 'status assigned'
                    : 'status pending'
                }>
                  {delivery.status ?? 'PENDING'}
                </span>

                <p>
                <button
                  className="edit-button"
                  onClick={() => setEditingDelivery(delivery)}
                >
                  Modifier
                </button>
                <button
                  className="delete-button"
                  onClick={() => deleteDelivery(delivery.id)}
                >
                  Supprimer
                </button>
                </p>

                <p>
                  {delivery.driver
                    ? delivery.driver.name
                    : 'Aucun chauffeur'}
                </p>

              </div>

            </div>

          ))}

        </section>


        {/* CHAUFFEURS */}

        <section className="card">

          <div className="card-header">

            <h2>Chauffeurs</h2>

            <span className="badge">
              {drivers.length}
            </span>

          </div>

          {drivers.map(driver => {

            const numberOfDeliveries = deliveries.filter(
              delivery => delivery.driver?.id === driver.id
            ).length

            return (

              <div className="driver" key={driver.id}>

                <div>
                  <strong>{driver.name}</strong>

                  <p>
                    {numberOfDeliveries} livraison
                    {numberOfDeliveries > 1 ? 's' : ''}
                  </p>
                </div>

                <span className="available">
                  Disponible
                </span>

              </div>

            )

          })}

        </section>

      </main>

    </div>
  )
}

export default App