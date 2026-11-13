import { useEffect, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import { api } from "../api.js";
import { pesos } from "../fechas.js";

const FAMILIAS = [
  "TRADICIONAL",
  "SEMIPERMANENTE",
  "MIXTO",
  "SOFT_GEL",
  "RESINA",
];
const VACIO = {
  nombre: "",
  precio: "",
  familia: "TRADICIONAL",
  duracionMin: "",
};

// Pantalla para administrar los servicios: ver, buscar, crear, editar y borrar (CRUD)
export default function Servicios() {
  const [servicios, setServicios] = useState([]);
  const [busca, setBusca] = useState("");
  const [familiaFiltro, setFamiliaFiltro] = useState("TODAS");
  const [form, setForm] = useState(VACIO);
  const [editando, setEditando] = useState(null); // id del servicio que se edita
  const [confirmar, setConfirmar] = useState(null); // id que se quiere borrar
  const [error, setError] = useState("");
  const [ok, setOk] = useState("");

  // GET /api/servicios (o /buscar si hay texto)
  function cargar() {
    const pedido = busca.trim()
      ? api.buscarServicios(busca.trim())
      : api.servicios();
    pedido.then(setServicios).catch((e) => setError(e.message));
  }
  useEffect(cargar, [busca]);

  function cambiar(campo, valor) {
    setForm({ ...form, [campo]: valor });
  }

  function empezarEdicion(s) {
    setEditando(s.id);
    setForm({
      nombre: s.nombre,
      precio: String(s.precio),
      familia: s.familia,
      duracionMin: String(s.duracionMin),
    });
    setError("");
    setOk("");
  }

  function cancelar() {
    setEditando(null);
    setForm(VACIO);
  }

  // POST (crear) o PUT (actualizar)
  async function guardar(e) {
    e.preventDefault();
    setError("");
    setOk("");
    const datos = {
      nombre: form.nombre,
      precio: Number(form.precio),
      familia: form.familia,
      duracionMin: Number(form.duracionMin),
    };
    try {
      if (editando) {
        await api.editarServicio(editando, datos);
        setOk("Servicio actualizado");
      } else {
        await api.crearServicio(datos);
        setOk("Servicio creado");
      }
      cancelar();
      cargar();
    } catch (er) {
      setError(er.message);
    }
  }

  // DELETE
  async function borrar(id) {
    setError("");
    setOk("");
    try {
      await api.borrarServicio(id);
      setOk("Servicio eliminado");
      setConfirmar(null);
      cargar();
    } catch (er) {
      setError(er.message);
      setConfirmar(null);
    }
  }

  // El filtro por familia se hace en el navegador con los datos que ya llegaron
  const visibles =
    familiaFiltro === "TODAS"
      ? servicios
      : servicios.filter((s) => s.familia === familiaFiltro);

  return (
    <section>
      <div className="encabezado">
        <h2>Servicios</h2>
      </div>

      <form className="form-servicio" onSubmit={guardar}>
        <label>
          Nombre
          <input
            value={form.nombre}
            onChange={(e) => cambiar("nombre", e.target.value)}
            placeholder="Ej: Semipermanente dama"
          />
        </label>
        <label>
          Precio
          <input
            type="number"
            min="0"
            step="1000"
            value={form.precio}
            onChange={(e) => cambiar("precio", e.target.value)}
          />
        </label>
        <label>
          Familia
          <select
            value={form.familia}
            onChange={(e) => cambiar("familia", e.target.value)}
          >
            {FAMILIAS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </label>
        <label>
          Duración (min)
          <input
            type="number"
            min="0"
            step="5"
            value={form.duracionMin}
            onChange={(e) => cambiar("duracionMin", e.target.value)}
          />
        </label>
        <div className="botones-form">
          <button className="primario" type="submit">
            <Plus size={16} />{" "}
            {editando ? "Guardar cambios" : "Agregar servicio"}
          </button>
          {editando && (
            <button type="button" className="chip" onClick={cancelar}>
              Cancelar
            </button>
          )}
        </div>
      </form>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}
      {ok && <p className="exito">{ok}</p>}

      <label className="buscador-servicios">
        <Search size={16} />
        <input
          value={busca}
          onChange={(e) => setBusca(e.target.value)}
          placeholder="Buscar servicio por nombre…"
        />
      </label>

      <label>
        Familia
        <select
          value={familiaFiltro}
          onChange={(e) => setFamiliaFiltro(e.target.value)}
        >
          <option value="TODAS">Todas</option>
          {FAMILIAS.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </label>

      {visibles.length === 0 && (
        <p className="vacio">No hay servicios para mostrar.</p>
      )}
      <ul className="historial">
        {visibles.map((s) => (
          <li key={s.id} className="fila-servicio">
            <div className="datos-servicio">
              <b>{s.nombre}</b>
              <small className="suave">
                {s.familia} · {s.duracionMin} min
              </small>
            </div>
            <strong>{pesos(s.precio)}</strong>
            <div className="acciones">
              <button
                className="icono"
                aria-label={`Editar ${s.nombre}`}
                onClick={() => empezarEdicion(s)}
              >
                <Pencil size={16} />
              </button>
              {confirmar === s.id ? (
                <>
                  <button className="chip peligro" onClick={() => borrar(s.id)}>
                    Sí, borrar
                  </button>
                  <button className="chip" onClick={() => setConfirmar(null)}>
                    No
                  </button>
                </>
              ) : (
                <button
                  className="icono"
                  aria-label={`Borrar ${s.nombre}`}
                  onClick={() => setConfirmar(s.id)}
                >
                  <Trash2 size={16} />
                </button>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
