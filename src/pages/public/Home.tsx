// import { Link } from 'react-router-dom';
// import { colorAzul, colorBranco } from '../../values/colors';

// import imagembackground from '../../../img/background4.png'

const Home = () => {
  return (
    <>

      <div style={{ backgroundColor: '#f7f9fc', minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
        
        <main style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1rem' }}>
          {/* <img src={imagembackground}></img> */}
          <div style={{ textAlign: 'center', maxWidth: '800px' }}>
            {/* <h2 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: colorAzul }}>
              Bem-vindo aos <span style={{ color: '#0d6efd' }}>Serviços do Limcom</span>
            </h2> */}
            {/* <p style={{ fontSize: '1.2rem', color: '#555', marginBottom: '2rem' }}>
              Conheça nossos serviços
            </p> */}
            {/* <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/agendamento" style={{ ...buttonStyle, backgroundColor: colorAzul, color: colorBranco }}>
                Quero fazer um orçamento e agendemento de serviço
              </Link>
            </div> */}
          </div>
        </main>
      </div>
    </>
  );
};


const buttonStyle = {
  padding: '0.75rem 1.5rem',
  borderRadius: '8px',
  fontWeight: 'bold',
  textDecoration: 'none',
  transition: '0.3s',
};

export default Home;
