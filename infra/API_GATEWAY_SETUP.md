# API Gateway Configuration para meuspets.com

## 📋 Pré-requisitos

1. ✅ Domínio registrado: `meuspets.com`
2. ✅ Certificado SSL na AWS Certificate Manager (us-east-1)
3. ✅ EC2 instance rodando backend na porta 3001
4. ✅ ALB (Application Load Balancer) ou NLB configurado

## 🏗️ Passos para Configurar o API Gateway

### 1. Criar um API Gateway HTTP

```bash
# Via AWS Console ou CLI
aws apigateway create-rest-api \
  --name "MeusPets API" \
  --description "API Gateway para meuspets.com" \
  --region us-east-1
```

### 2. Configurar Recursos e Métodos

#### Resource: `/` (root)
- GET → Lambda proxy ou backend service

#### Resource: `/api`
- Create as sub-resource

#### Resource: `/api/v1`
- Proxy integração para EC2 backend

### 3. Integração com Backend EC2

```yaml
Method: ANY
Integration type: HTTP_PROXY
HTTP Proxy URI: http://{ALB_DNS}:3001
Pass-through behavior: When there are no templates
```

### 4. Configurar Custom Domain

```bash
aws apigateway create-domain-name \
  --domain-name meuspets.com \
  --certificate-arn arn:aws:acm:us-east-1:ACCOUNT_ID:certificate/CERT_ID \
  --endpoint-type REGIONAL \
  --region us-east-1
```

### 5. Mapear API Gateway ao Domínio

```bash
aws apigateway create-base-path-mapping \
  --domain-name meuspets.com \
  --rest-api-id {API_ID} \
  --stage prod \
  --base-path api \
  --region us-east-1
```

### 6. Configurar Route53

```bash
# Criar CNAME record apontando para o API Gateway
aws route53 change-resource-record-sets \
  --hosted-zone-id {ZONE_ID} \
  --change-batch '{
    "Changes": [{
      "Action": "CREATE",
      "ResourceRecordSet": {
        "Name": "meuspets.com",
        "Type": "A",
        "AliasTarget": {
          "HostedZoneId": "{API_GATEWAY_ZONE_ID}",
          "DNSName": "{API_GATEWAY_DNS}",
          "EvaluateTargetHealth": false
        }
      }
    }]
  }'
```

## 🔀 Opção Alternativa: CloudFront + ALB

Se preferir uma configuração mais simples:

### Arquitetura
```
meuspets.com (Route53)
     ↓
CloudFront Distribution
     ↓
ALB (Application Load Balancer)
     ↓
EC2 Instance (Backend + Frontend)
```

### Criar ALB

```bash
aws elbv2 create-load-balancer \
  --name cs20252-alb \
  --subnets subnet-xxx subnet-yyy \
  --security-groups sg-xxx \
  --scheme internet-facing \
  --type application
```

### Criar Target Group

```bash
aws elbv2 create-target-group \
  --name cs20252-backend \
  --protocol HTTP \
  --port 3001 \
  --vpc-id vpc-xxx
```

## 🔒 CORS Configuration

No backend (`backend/src/index.ts`), já está configurado:

```typescript
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});
```

Para produção, restrinja para apenas meuspets.com:

```typescript
res.header('Access-Control-Allow-Origin', 'https://meuspets.com');
```

## 📝 Swagger com Domínio

O Swagger agora inclui o domínio:

```yaml
servers:
  - url: http://localhost:3001/api/v1
    description: Desenvolvimento
  - url: https://meuspets.com/api/v1
    description: Produção
```

Acessível em: **https://meuspets.com/api/v1/docs**

## 🧪 Teste de Conectividade

```bash
# Teste básico
curl https://meuspets.com/api/v1/health

# Teste com JWT
TOKEN="your-jwt-token"
curl -H "Authorization: Bearer $TOKEN" \
  https://meuspets.com/api/v1/pets

# Teste com verbose
curl -v https://meuspets.com/api/v1/health
```

## 🔍 Troubleshooting

### "DNS resolution failed"
- Aguarde propagação do DNS (até 48h)
- Verifique Record no Route53
- Teste com `nslookup meuspets.com`

### "403 Forbidden"
- Verifique Security Groups
- Confirme ALB está em running
- Verifique backend está listening na porta 3001

### "504 Gateway Timeout"
- Backend está ativo?
- `curl http://{EC2_IP}:3001/health`
- Verificar CloudWatch logs

### "SSL Certificate Error"
- Certificado está validado no Certificate Manager?
- Custom domain mapeado corretamente?
- CNAME/A record criado no Route53?

## 📊 Monitoramento

### CloudWatch Metrics
```bash
aws cloudwatch get-metric-statistics \
  --namespace AWS/ApiGateway \
  --metric-name Count \
  --start-time 2025-11-27T00:00:00Z \
  --end-time 2025-11-27T23:59:59Z \
  --period 300 \
  --statistics Sum
```

### ALB Logs
```bash
aws logs tail /aws/alb/cs20252-alb --follow
```

## 📚 Referências Adicionais

- [AWS API Gateway Documentation](https://docs.aws.amazon.com/apigateway/)
- [CloudFront Distribution Setup](https://docs.aws.amazon.com/AmazonCloudFront/latest/DeveloperGuide/)
- [Route53 DNS Management](https://docs.aws.amazon.com/route53/latest/developerguide/)
- [ALB Target Groups](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/load-balancer-target-groups.html)
