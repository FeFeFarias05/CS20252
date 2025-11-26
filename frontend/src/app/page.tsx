export default function Home() {
  return (
    <main className="container">
      <div className="content">
        <h1>🐾 Sistema de Gerenciamento de Pets</h1>
        <p>Gerencie as informações dos seus pets de forma fácil e organizada!</p>
        
        <div className="info-box">
          <h2>Recursos disponíveis:</h2>
          <ul>
            <li>Cadastre seus pets com foto, nome, idade, raça e peso</li>
            <li>Adicione informações sobre medicações</li>
            <li>Edite e atualize as informações a qualquer momento</li>
            <li>Remova pets do sistema quando necessário</li>
            <li>Visualize todos os seus pets em um só lugar</li>
          </ul>
        </div>

        <div style={{ marginTop: '30px', textAlign: 'center' }}>
          <a href="/pets" style={{
            display: 'inline-block',
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            color: 'white',
            padding: '15px 40px',
            borderRadius: '8px',
            textDecoration: 'none',
            fontWeight: '600',
            fontSize: '1.1rem',
            transition: 'transform 0.3s ease',
          }}>
            Acessar Meus Pets →
          </a>
        </div>
      </div>
    </main>
  );
}
