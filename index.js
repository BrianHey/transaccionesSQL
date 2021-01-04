const { Pool } = require("pg");

const pool = new Pool({
  user: "postgres",
  host: "localhost",
  password: "postgres",
  port: 5432,
  database: "bank",
});

const arg = process.argv.slice(2);
const comando = arg[0];
const fecha = arg[1];
const monto = arg[2];
const cuentaOrigen = arg[3];
const cuentaDestino = arg[4];
const descripcion = arg[5];

const transaccion = async (
  fecha,
  monto,
  cuentaOrigen,
  cuentaDestino,
  descripcion,
  client
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
    await client.query("BEGIN");
    const desc = await client.query(descuento);
    const query = await client.query(consulta);
    const deposito = await client.query(acreditacion);
    await client.query("COMMIT");
  } catch (e) {
    console.log(e);
    await client.query("ROLLBACK");
  }
};

pool.connect(async (err, client, release) => {
  if (comando == "transaccion") {
    await transaccion(
      fecha,
      monto,
      cuentaOrigen,
      cuentaDestino,
      descripcion,
      client
    );
  }
  release();
  pool.end();
});
