-- Mary Nails | V1: esquema (PostgreSQL 16). 12 tablas, normalizado hasta 3FN/BCNF.

CREATE TABLE sector (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    barrio     VARCHAR(80) NOT NULL,
    municipio  VARCHAR(60) NOT NULL,
    CONSTRAINT uq_sector UNIQUE (barrio, municipio)
);

CREATE TABLE cliente (
    id               BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre           VARCHAR(100) NOT NULL,
    telefono         VARCHAR(20),
    direccion        VARCHAR(150),
    sector_id        BIGINT REFERENCES sector(id),
    frecuencia_dias  SMALLINT CHECK (frecuencia_dias IN (15, 20, 30, 45, 60)),
    observaciones    TEXT
);

CREATE TABLE servicio (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(100) NOT NULL UNIQUE,
    precio        NUMERIC(10,0) NOT NULL CHECK (precio >= 0),
    familia       VARCHAR(20) NOT NULL
                  CHECK (familia IN ('TRADICIONAL','SEMIPERMANENTE','MIXTO','SOFT_GEL','RESINA')),
    duracion_min  SMALLINT NOT NULL CHECK (duracion_min > 0)
);

CREATE TABLE cita (
    id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    cliente_id      BIGINT NOT NULL REFERENCES cliente(id),
    servicio_id     BIGINT NOT NULL REFERENCES servicio(id),
    fecha           DATE NOT NULL,
    hora            TIME NOT NULL,
    lugar           VARCHAR(10) NOT NULL DEFAULT 'DOMICILIO'
                    CHECK (lugar IN ('DOMICILIO','CASA_MARY')),
    estado          VARCHAR(12) NOT NULL DEFAULT 'PROGRAMADA'
                    CHECK (estado IN ('PROGRAMADA','ATENDIDA','CANCELADA','NO_ASISTIO')),
    precio_cobrado  NUMERIC(10,0) NOT NULL CHECK (precio_cobrado >= 0),  -- precio al momento de la cita
    extra_diseno    NUMERIC(10,0) NOT NULL DEFAULT 0 CHECK (extra_diseno >= 0),
    valor_pagado    NUMERIC(10,0) NOT NULL DEFAULT 0 CHECK (valor_pagado >= 0),
    medio_pago      VARCHAR(10) CHECK (medio_pago IN ('EFECTIVO','TRANSFERENCIA')),
    observaciones   TEXT
);
CREATE INDEX ix_cita_fecha ON cita (fecha);
CREATE INDEX ix_cita_cliente ON cita (cliente_id);

CREATE TABLE producto (
    id            BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre        VARCHAR(120) NOT NULL UNIQUE,
    categoria     VARCHAR(40) NOT NULL,
    modo_control  VARCHAR(8) NOT NULL DEFAULT 'MANUAL'
                  CHECK (modo_control IN ('CONSUMO','TIEMPO','MANUAL')),
    presentacion  NUMERIC(8,2),                 -- tamaño informativo: 14, 7, 250...
    unidad        VARCHAR(10),                  -- ml, L, unidad, paquete, caja
    rendimiento   NUMERIC(8,2),                 -- CONSUMO: citas que rinde; TIEMPO: días que dura
    stock_actual  NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (stock_actual >= 0), -- en presentaciones
    stock_minimo  NUMERIC(8,2) NOT NULL DEFAULT 0 CHECK (stock_minimo >= 0),
    es_habitual   BOOLEAN NOT NULL DEFAULT FALSE,
    es_critico    BOOLEAN NOT NULL DEFAULT FALSE,
    imagen_url    VARCHAR(300),
    CONSTRAINT ck_rendimiento CHECK (modo_control = 'MANUAL' OR rendimiento IS NULL OR rendimiento > 0)
);

CREATE TABLE color (
    producto_id   BIGINT PRIMARY KEY REFERENCES producto(id) ON DELETE CASCADE,
    linea         VARCHAR(30) NOT NULL,   -- Gelpolish, Masglo, Gel Evolution
    codigo        VARCHAR(40) NOT NULL,   -- numero (texto, con ceros) o nombre del tono
    acabado       VARCHAR(20),            -- cremoso, perlado, traslucido, metalizado...
    familia_color VARCHAR(20),            -- rojo, rosado, nude, azul... (para sugerir similares)
    CONSTRAINT uq_color UNIQUE (linea, codigo)
);

CREATE TABLE receta (
    servicio_id  BIGINT NOT NULL REFERENCES servicio(id) ON DELETE CASCADE,
    producto_id  BIGINT NOT NULL REFERENCES producto(id),
    PRIMARY KEY (servicio_id, producto_id)
);

CREATE TABLE compra (
    id         BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha      DATE NOT NULL,
    proveedor  VARCHAR(80)
);

CREATE TABLE detalle_compra (
    compra_id       BIGINT NOT NULL REFERENCES compra(id) ON DELETE CASCADE,
    producto_id     BIGINT NOT NULL REFERENCES producto(id),
    cantidad        NUMERIC(8,2) NOT NULL CHECK (cantidad > 0),
    costo_unitario  NUMERIC(10,0) NOT NULL CHECK (costo_unitario >= 0),
    PRIMARY KEY (compra_id, producto_id)
);

CREATE TABLE movimiento (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    producto_id  BIGINT NOT NULL REFERENCES producto(id),
    fecha        DATE NOT NULL DEFAULT CURRENT_DATE,
    tipo         VARCHAR(8) NOT NULL CHECK (tipo IN ('ENTRADA','SALIDA','AJUSTE')),
    cantidad     NUMERIC(8,2) NOT NULL
);
CREATE INDEX ix_movimiento_producto ON movimiento (producto_id, fecha);

CREATE TABLE gasto (
    id           BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    fecha        DATE NOT NULL,
    categoria    VARCHAR(20) NOT NULL
                 CHECK (categoria IN ('GASOLINA','ACEITE_MOTO','MANTENIMIENTO_MOTO','OTRO')),
    monto        NUMERIC(10,0) NOT NULL CHECK (monto > 0),
    descripcion  VARCHAR(150)
);

CREATE TABLE usuario (
    id          BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
    nombre      VARCHAR(80) NOT NULL,
    correo      VARCHAR(120) NOT NULL UNIQUE,
    clave_hash  VARCHAR(100) NOT NULL,     -- BCrypt
    rol         VARCHAR(12) NOT NULL CHECK (rol IN ('PROPIETARIA','ADMIN'))
);
