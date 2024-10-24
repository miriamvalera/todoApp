import { useEffect, useState } from "react";
import "./App.css";
import Item from "./Item";
import "@fontsource/abril-fatface";

function App() {
  const [items, setItems] = useState([]);
  const [value, setValue] = useState("");
  const [showItems, setShowItems] = useState([]);

  useEffect(() => {
    loadItems();
    handleWebSocket();
  }, []);

  useEffect(() => {
    setShowItems(items.filter((item) => !item.done));
  }, [items]);

  function handleName(e) {
    const name = e?.target?.value;
    setValue(name);
    if (name.trim().length === 0) {
      return setShowItems(items.filter((item) => !item.done));
    }
    const filteredItems = items.filter((item) =>
      item.name.toLowerCase().startsWith(name.toLowerCase())
    );
    setShowItems(filteredItems);
  }
  async function loadItems() {
    const res = await fetch("https://api.casa.full4media.com/api/v1/todo");
    if (!res.ok) {
      throw new Error("Error al cargar los items");
    }
    const data = await res.json();
    setItems(data);
    setShowItems(items.filter((item) => !item.done));
  }

  function showAllItems() {
    setShowItems(items);
  }

  function showPendingItems() {
    setShowItems(items.filter((item) => !item.done));
  }

  function showCompletedItems() {
    setShowItems(items.filter((item) => item.done));
  }

  async function deleteAllCompletedItems() {
    const completedItems = items.filter((item) => item.done);
    await Promise.all(completedItems.map((item) => deleteItem(item.id)));
    await loadItems();
  }

  async function saveItem() {
    const res = await fetch("https://api.casa.full4media.com/api/v1/todo", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        name: value,
      }),
    });

    if (!res.ok) {
      throw new Error("Error al guardar el item");
    }
    setValue("");
  }

  async function deleteItem(id) {
    const res = await fetch(
      `https://api.casa.full4media.com/api/v1/todo/${id}`,
      {
        method: "DELETE",
      }
    );

    if (!res.ok) {
      throw new Error("Error al eliminar el item");
    }
  }

  async function markUndone(id) {
    const res = await fetch(
      `https://api.casa.full4media.com/api/v1/todo/${id}/mark-undone`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      throw new Error("Error al marcar sin hacer el item");
    }
  }

  async function markDone(id) {
    const res = await fetch(
      `https://api.casa.full4media.com/api/v1/todo/${id}/mark-done`,
      {
        method: "POST",
      }
    );

    if (!res.ok) {
      throw new Error("Error al marcar el item");
    }
  }

  async function handleAddItems(event) {
    if (event.keyCode !== 13) return;
    if (event.target.value.trim().length === 0) return;

    await saveItem();
    await loadItems();
  }

  async function handleDeleteItems(id) {
    await deleteItem(id);
    await loadItems();
  }

  async function handleToggleItem(id) {
    const itemFound = items.find((i) => i.id === id);

    if (itemFound.done) {
      await markUndone(id);
    } else {
      await markDone(id);
    }
    await loadItems();
    setValue("");
  }

  async function handleWebSocket() {
    // Crear una conexión WebSocket
    const socket = new WebSocket("ws://api.casa.full4media.com/ws/todos");

    // Evento que se dispara cuando la conexión se abre
    socket.onopen = function (event) {
      console.log("Conexión WebSocket establecida.");
      // Puedes enviar un mensaje al servidor si es necesario
      socket.send(
        JSON.stringify({
          action: "create",
          todo: {
            name: "Comprar leche",
            done: false,
          },
        })
      );
    };

    // Evento que se dispara cuando llega un mensaje del servidor
    socket.onmessage = function (event) {
      console.log("Mensaje recibido del servidor:", event.data);
      // Aquí puedes procesar los datos recibidos del WebSocket
    };

    // Evento que se dispara cuando la conexión se cierra
    socket.onclose = function (event) {
      console.log("Conexión WebSocket cerrada.");
    };

    // Evento que se dispara cuando ocurre un error en la conexión
    socket.onerror = function (error) {
      console.error("Error en la conexión WebSocket:", error);
    };
  }
  return (
    <div className="App">
      <div>
        <section className="todoapp">
          <header className="header">
            <h1>
              Lista de la compra
              <small
                style={{ fontSize: "0.5em", marginLeft: "10px", color: "#888" }}
              >
                v0.1.6
              </small>
            </h1>

            <input
              id="new-todo-input"
              className="new-todo"
              placeholder="¿Qué falta?"
              autoFocus=""
              autoComplete="off"
              onKeyUp={handleAddItems}
              onChange={handleName}
              value={value}
            />
          </header>

          <section className="main">
            <input id="toggle-all" className="toggle-all" type="checkbox" />
            <label htmlFor="toggle-all">Mark all as complete</label>
            <ul className="todo-list">
              {showItems.map((item) => (
                <Item
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  done={item.done}
                  quantity={item.quantity}
                  handleDeleteItems={handleDeleteItems}
                  handleToggleItem={handleToggleItem}
                />
              ))}
            </ul>
          </section>

          <footer className="footer">
            <span className="todo-count">
              <strong id="pending-count">
                {items.filter((i) => !i.done).length}
              </strong>
              &nbsp;pendiente(s)
            </span>
            <ul className="filters">
              <li onClick={showAllItems}>
                <a className="filtro" href="#/">
                  Todos
                </a>
              </li>
              <li onClick={showPendingItems}>
                <a className="filtro" href="#/active">
                  Pendientes
                </a>
              </li>
              <li onClick={showCompletedItems}>
                <a className="filtro" href="#/completed">
                  Completados
                </a>
              </li>
            </ul>
            <button
              className="clear-completed"
              onClick={deleteAllCompletedItems}
            >
              Borrar completados
            </button>
          </footer>
        </section>
      </div>
    </div>
  );
}

export default App;
