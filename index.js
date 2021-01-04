const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  port: 5432,
  database: "banco",
});

const arg = process.argv.slice(2);
const comando = arg[0];
const fecha = arg[1];
const monto = arg[2];
const cuentaOrigen = arg[3];
const cuentaDestino = arg[4];
const descripcion = arg[5];

const transaccion = async (
  descripcion,
  fecha,
  monto,
  cuentaOrigen,
  cuentaDestino
) => {
  const consulta = {
    text: "INSERT INTO transacciones values ($1, $2, $3, $4) RETURNING*;",
    values: [descripcion, fecha, monto, cuentaDestino],
  };
  const descuento = {
    text: "UPDATE cuentas SET saldo = saldo - $1 where ID = $2",
    values: [monto, cuentaOrigen],
  };
  const acreditacion = {
    text: "UPDATE cuentas SET SALDO = saldo + $1 where ID = $2",
    values: [monto, cuentaDestino],
  };
  try {
    console.log("TRY");
    await pool.query("BEGIN");
    const desc = await pool.query(descuento);
    const query = await pool.query(consulta);
    const deposito = await pool.query(acreditacion);
    await pool.query("COMMIT");
  } catch (e) {
    console.log(e);
    await pool.query("ROLLBACK");
  }
};

if (comando == "transaccion") {
  transaccion(descripcion, fecha, monto, cuentaOrigen, cuentaDestino);
}
