-- Pago mixto (20-nov-2026): cuando en una visita de varias personas una paga en efectivo y otra
-- por transferencia, el cobro de la cita queda como MIXTO.
ALTER TABLE cita DROP CONSTRAINT IF EXISTS cita_medio_pago_check;
ALTER TABLE cita ADD CONSTRAINT cita_medio_pago_check
    CHECK (medio_pago IN ('EFECTIVO', 'TRANSFERENCIA', 'MIXTO'));
