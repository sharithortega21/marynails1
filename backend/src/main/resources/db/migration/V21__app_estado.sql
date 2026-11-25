-- Estado interno de la aplicacion (25-nov-2026). Por ahora: el dia en que se cargo la demostracion,
-- para renovarla una vez al dia y que la agenda siempre gire alrededor de hoy.
CREATE TABLE app_estado (
    clave VARCHAR(40) PRIMARY KEY,
    valor VARCHAR(200) NOT NULL
);
