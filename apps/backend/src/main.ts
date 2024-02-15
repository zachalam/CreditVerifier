import express from 'express';
import { proof, verify } from './services/nargo';

const host = process.env.HOST ? process.env.HOST: 'localhost';
const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const app = express();
app.use(express.json());

app.get('/', (req, res) => {
  res.redirect('/health-check');
});

app.get('/health-check', (req, res) => {
  res.sendStatus(200);
});

app.post('/proof', async (req, res) => {
  const { verifiedAmount, loanValue, downpaymentPercent } = req.body;
  const proofData: Object = await proof(verifiedAmount, loanValue, downpaymentPercent);
  res.status(200).json(proofData);
});

app.post('/verify', async (req, res) => {
  const { proofData, loanValue, downpaymentPercent } = req.body;
  const verifyData: Object = await verify(proofData, loanValue, downpaymentPercent);
  res.status(200).json(verifyData);
});

app.listen(port, host, () => {
  console.log(`[ ready ] http://${host}:${port}`);
});
