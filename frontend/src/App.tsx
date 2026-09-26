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