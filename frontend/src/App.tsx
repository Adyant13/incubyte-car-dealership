
import { useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API = "http://localhost:5000/api";

type Vehicle = {
  id: number;
  make: string;
  model: string;
  year: number;
  price: number | string;
  quantity: number;
};

type User = {
  id: number;
  name: string;
  email: string;
  role: string;
};

export default function App() {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState<User | null>(() => {
    const saved = localStorage.getItem("user");
    return saved ? JSON.parse(saved) : null;
  });
  const [mode, setMode] = useState<"login" | "register">("login");
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [search, setSearch] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("2024");
  const [price, setPrice] = useState("");
  const [quantity, setQuantity] = useState("1");

  const client = axios.create({
    baseURL: API,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });

  async function loadVehicles(query = search) {
    try {
      const response = await client.get("/vehicles", {
        params: { search: query },
      });
      setVehicles(response.data.vehicles);
    } catch {
      setMessage("Could not load inventory. Please sign in again if your session expired.");
    }
  }

  useEffect(() => {
    if (token) void loadVehicles("");
    // Initial inventory load when the session token changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  async function authenticate(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      const endpoint = mode === "login" ? "/auth/login" : "/auth/register";
      const payload =
        mode === "login"
          ? { email, password }
          : { name, email, password };

      const response = await axios.post(`${API}${endpoint}`, payload);

      if (mode === "register") {
        setMessage("Account created! Please sign in.");
        setMode("login");
      } else {
        localStorage.setItem("token", response.data.token);
        localStorage.setItem("user", JSON.stringify(response.data.user));
        setToken(response.data.token);
        setUser(response.data.user);
        setPassword("");
        setMessage("Welcome back!");
      }
    } catch (error) {
      if (axios.isAxiosError(error)) {
        setMessage(error.response?.data?.message || "Authentication failed.");
      } else {
        setMessage("Something went wrong.");
      }
    } finally {
      setBusy(false);
    }
  }

  function logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setToken("");
    setUser(null);
    setVehicles([]);
    setMessage("You have signed out.");
  }

  async function addVehicle(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setMessage("");

    try {
      await client.post("/vehicles", {
        make,
        model,
        year: Number(year),
        price: Number(price),
        quantity: Number(quantity),
      });
      setMake("");
      setModel("");
      setPrice("");
      setQuantity("1");
      setMessage("Vehicle added successfully.");
      await loadVehicles();
    } catch (error) {
      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Could not add vehicle."
          : "Could not add vehicle."
      );
    } finally {
      setBusy(false);
    }
  }

  async function purchaseVehicle(id: number) {
    const requested = window.prompt("How many vehicles would you like to purchase?", "1");
    if (requested === null) return;

    const amount = Number(requested);
    if (!Number.isInteger(amount) || amount <= 0) {
      setMessage("Enter a positive whole number.");
      return;
    }

    try {
      await client.post(`/vehicles/${id}/purchase`, { quantity: amount });
      setMessage("Purchase completed. Inventory updated.");
      await loadVehicles();
    } catch (error) {
      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Purchase failed."
          : "Purchase failed."
      );
    }
  }

  async function restockVehicle(id: number) {
    const requested = window.prompt("How many units should be added?", "1");
    if (requested === null) return;

    const amount = Number(requested);
    if (!Number.isInteger(amount) || amount <= 0) {
      setMessage("Enter a positive whole number.");
      return;
    }

    try {
      await client.patch(`/vehicles/${id}/restock`, { quantity: amount });
      setMessage("Vehicle restocked successfully.");
      await loadVehicles();
    } catch (error) {
      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Restocking failed."
          : "Restocking failed."
      );
    }
  }

  async function deleteVehicle(id: number) {
    if (!window.confirm("Are you sure you want to delete this vehicle?")) return;

    try {
      await client.delete(`/vehicles/${id}`);
      setMessage("Vehicle deleted.");
      await loadVehicles();
    } catch (error) {
      setMessage(
        axios.isAxiosError(error)
          ? error.response?.data?.message || "Deletion failed."
          : "Deletion failed."
      );
    }
  }

  if (!token) {
    return (
      <main className="auth-page">
        <section className="auth-panel">
          <div className="brand-mark">M</div>
          <p className="eyebrow">DEALERSHIP MANAGEMENT</p>
          <h1>Drive your inventory forward.</h1>
          <p className="muted">
            A simple workspace to discover vehicles and manage your dealership inventory.
          </p>

          <div className="auth-tabs">
            <button
              className={mode === "login" ? "tab active" : "tab"}
              onClick={() => setMode("login")}
            >
              Sign in
            </button>
            <button
              className={mode === "register" ? "tab active" : "tab"}
              onClick={() => setMode("register")}
            >
              Create account
            </button>
          </div>

          <form onSubmit={authenticate} className="form-stack">
            {mode === "register" && (
              <label>
                Full name
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                  maxLength={100}
                  placeholder="Your name"
                />
              </label>
            )}
            <label>
              Email address
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                placeholder="you@example.com"
              />
            </label>
            <label>
              Password
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                minLength={8}
                placeholder="At least 8 characters"
              />
            </label>
            <button className="primary-button" disabled={busy}>
              {busy ? "Please wait..." : mode === "login" ? "Sign in →" : "Create account →"}
            </button>
          </form>
          {message && <p className="notice">{message}</p>}
          <p className="fine-print">Secure access · Powered by your dealership API</p>
        </section>
      </main>
    );
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div className="brand">
          <div className="brand-mark small">M</div>
          <div>
            <strong>Motorstock</strong>
            <span>Inventory management</span>
          </div>
        </div>
        <div className="account">
          <div className="avatar">{(user?.name || "U").charAt(0).toUpperCase()}</div>
          <div className="account-info">
            <strong>{user?.name || "User"}</strong>
            <span>{user?.role || "user"}</span>
          </div>
          <button className="secondary-button" onClick={logout}>Sign out</button>
        </div>
      </header>

      <section className="welcome">
        <div>
          <p className="eyebrow">YOUR DEALERSHIP</p>
          <h1>Vehicle inventory</h1>
          <p className="muted">Find vehicles, check availability, and manage your stock.</p>
        </div>
        <div className="inventory-stat">
          <span>Vehicle listings</span>
          <strong>{vehicles.length}</strong>
        </div>
      </section>

      {message && (
        <div className="notice dashboard-notice">
          <span>{message}</span>
          <button onClick={() => setMessage("")} aria-label="Dismiss message">×</button>
        </div>
      )}

      <section className="toolbar">
        <div className="search-box">
          <span aria-hidden="true">⌕</span>
          <input
            value={search}
            onChange={(event) => {
              const value = event.target.value;
              setSearch(value);
              void loadVehicles(value);
            }}
            placeholder="Search by make or model..."
            aria-label="Search vehicles"
          />
        </div>
        <button className="secondary-button" onClick={() => void loadVehicles()}>
          Refresh inventory
        </button>
      </section>

      <section className="content-grid">
        <div className="inventory-section">
          <div className="section-heading">
            <h2>Available vehicles</h2>
            <span>{vehicles.length} listings</span>
          </div>

          {vehicles.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">⌕</div>
              <h3>No vehicles found</h3>
              <p>Try a different search or add a vehicle to your inventory.</p>
            </div>
          ) : (
            <div className="vehicle-grid">
              {vehicles.map((vehicle) => (
                <article className="vehicle-card" key={vehicle.id}>
                  <div className="vehicle-art">
                    <span className="vehicle-year">{vehicle.year}</span>
                    <svg viewBox="0 0 240 100" role="img" aria-label="Car illustration">
                      <path
                        d="M30 65 L43 42 Q47 34 60 33 L89 29 L112 10 Q118 5 130 7 L166 15 Q176 18 184 33 L202 39 Q215 42 218 55 L220 69 L206 74 L36 74 Z"
                        fill="currentColor"
                        opacity=".9"
                      />
                      <path d="M94 32 L117 13 Q121 10 130 12 L145 15 L151 32 Z" fill="#dce8ee" />
                      <path d="M156 17 L165 19 Q173 22 179 33 L158 32 Z" fill="#dce8ee" />
                      <circle cx="67" cy="72" r="16" fill="#17252c" />
                      <circle cx="67" cy="72" r="7" fill="#dce8ee" />
                      <circle cx="187" cy="72" r="16" fill="#17252c" />
                      <circle cx="187" cy="72" r="7" fill="#dce8ee" />
                    </svg>
                  </div>
                  <div className="vehicle-details">
                    <p className="vehicle-make">{vehicle.make}</p>
                    <h3>{vehicle.model}</h3>
                    <div className="vehicle-meta">
                      <span>{vehicle.year}</span>
                      <span className={vehicle.quantity > 0 ? "stock in-stock" : "stock out-stock"}>
                        {vehicle.quantity > 0 ? `${vehicle.quantity} in stock` : "Out of stock"}
                      </span>
                    </div>
                    <div className="vehicle-bottom">
                      <strong className="price">
                        {Number(vehicle.price).toLocaleString("en-IN", {
                          style: "currency",
                          currency: "INR",
                          maximumFractionDigits: 2,
                        })}
                      </strong>
                      <button
                        className="purchase-button"
                        disabled={vehicle.quantity <= 0}
                        onClick={() => void purchaseVehicle(vehicle.id)}
                      >
                        Purchase
                      </button>
                    </div>
                    {user?.role === "admin" && (
                      <div className="admin-actions">
                        <button onClick={() => void restockVehicle(vehicle.id)}>+ Restock</button>
                        <button onClick={() => void deleteVehicle(vehicle.id)}>Delete</button>
                      </div>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <aside className="add-panel">
          <div className="panel-icon">＋</div>
          <h2>Add a vehicle</h2>
          <p className="muted">Enter the details to add a listing to your inventory.</p>
          <form onSubmit={addVehicle} className="form-stack">
            <label>
              Make
              <input value={make} onChange={(event) => setMake(event.target.value)} required maxLength={100} placeholder="e.g. Toyota" />
            </label>
            <label>
              Model
              <input value={model} onChange={(event) => setModel(event.target.value)} required maxLength={100} placeholder="e.g. Corolla" />
            </label>
            <div className="two-columns">
              <label>
                Year
                <input type="number" min="1886" max="2100" value={year} onChange={(event) => setYear(event.target.value)} required />
              </label>
              <label>
                Quantity
                <input type="number" min="0" value={quantity} onChange={(event) => setQuantity(event.target.value)} required />
              </label>
            </div>
            <label>
              Price (₹)
              <input type="number" min="0" step="0.01" value={price} onChange={(event) => setPrice(event.target.value)} required placeholder="e.g. 850000" />
            </label>
            <button className="primary-button" disabled={busy}>
              {busy ? "Saving..." : "Add to inventory →"}
            </button>
          </form>
          <p className="panel-footnote">Inventory changes are saved to the database.</p>
        </aside>
      </section>

      <footer className="footer">Motorstock · Dealership inventory system</footer>
    </main>
  );
}
