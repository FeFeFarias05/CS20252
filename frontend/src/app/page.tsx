export default function Home() {
  return (
    <main className="container">
      <div className="content">
        <h1>Sistema de Gerenciamento Pet Clinic</h1>
        <p>Gerencie pets, donos e agendamentos de forma fácil e organizada!</p>
        
        <div className="info-box">
          <h2>Recursos disponíveis:</h2>
          <ul>
            <li><strong>Pets:</strong> Cadastre pets com foto, nome, idade, raça, peso e medicações</li>
            <li><strong>Donos:</strong> Gerencie informações dos donos (nome, email, telefone, endereço)</li>
            <li><strong>Agendamentos:</strong> Crie e acompanhe consultas, vacinas e procedimentos</li>
            <li><strong>Integração:</strong> Todos os dados são salvos no backend com DynamoDB</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px', display: 'flex', gap: '15px', justifyContent: 'center', flexWrap: 'wrap' }}>
          <a href="/pets" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
          }}>
            Pets
          </a>
          
          <a href="/owners" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
          }}>
            Donos
          </a>
          
          <a href="/appointments" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
            color: 'white',
            padding: '15px 30px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
          }}>
            Agendamentos
          </a>
        </div>
      </div>
    </main>
  );
}
