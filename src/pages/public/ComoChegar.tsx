import imagem from '../../../img/background4.png';

const ComoChegar = () => {
  return (
    <div style={{ 
      position: "absolute",
      top: 0,
      left: 0,
      width: "100vw",
      height: "100vh",
      overflow: "hidden",
      backgroundColor: "#111", // Fundo escuro caso a largura ultrapasse
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
    }}>
      
      {/* Imagem de fundo centralizada */}
      <img 
        src={imagem} 
        alt="Distribuidora Play Boy" 
        style={{
          height: "100vh", // Garante que a altura total da imagem seja visível
          width: "auto", // Mantém a proporção da imagem
          maxWidth: "100vw", // Impede que a imagem fique maior que a tela
        }}
      />

      {/* Área clicável do Instagram - Metade inferior esquerda */}
      <a
        href="https://www.instagram.com/playybebidas/"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          left: "0",
          bottom: "0",
          width: "50%",
          height: "50%",
          opacity: 0, // Invisível
          cursor: "pointer",
        }}
      ></a>

      {/* Área clicável da localização - Metade inferior direita */}
      <a
        href="https://www.google.com/maps?q=-20.41810,-40.33346"
        target="_blank"
        rel="noopener noreferrer"
        style={{
          position: "absolute",
          left: "50%",
          bottom: "0",
          width: "50%",
          height: "50%",
          opacity: 0, // Invisível
          cursor: "pointer",
        }}
      ></a>

    </div>
  );
};

export default ComoChegar;