import express from 'express';
import { generateKeyPairSync } from 'crypto';
import { exportJWK } from 'jose';
import bodyParser from 'body-parser';
import { createSign } from 'crypto';
import { SignJWT } from 'jose';

const app = express();
app.use(bodyParser.json());

(async function main(){
  const { publicKey, privateKey } = generateKeyPairSync('rsa', { modulusLength: 2048 });

  const jwk = await exportJWK(publicKey);
  jwk.kid = 'test-key-1';
  jwk.alg = 'RS256';
  jwk.use = 'sig';

  const jwks = { keys: [jwk] };

  app.get('/.well-known/jwks.json', (req, res) => {
    res.json(jwks);
  });

  app.post('/sign', async (req, res) => {
    const { sub='test-sub', roles=['user'], aud='test-aud', iss='http://test-issuer' } = req.body;
    const token = await new SignJWT({ roles })
      .setProtectedHeader({ alg: 'RS256', kid: jwk.kid })
      .setSubject(sub)
      .setIssuer(iss)
      .setAudience(aud)
      .setIssuedAt()
      .setExpirationTime('2h')
      .sign(privateKey as any);
    res.json({ token });
  });

  const port = +(process.env.MOCK_JWKS_PORT ?? 8001);
  app.listen(port, () => console.log(`Mock JWKS server listening on ${port}`));
})();
