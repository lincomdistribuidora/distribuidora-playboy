# Servicos


## Versão Beta, falta finalizar:
 -  Telas privadas
    - criar tela de perfil para alterar os dados cadastrais do admim
    - na tela de serviços relacionar com cliente, ajustar ordem para colocar o valor do serviço no final.
    - na tela de cadastrar cliente pegar informações mais completas, verificar quais informações e quais serão obrigatórias.
    - na tela de cadastrar cliente fazer as *validações* dos contatos conforme é selecionado pelo *tipo* sendo:'Telefone','Celular','WhatsApp','Email'.
    - na tela de entrada de custo
        - custo fixo
        - custo variaveis
 - Telas publicas
    - criar a pagina de login dos usuários publicos ou redirecionar se for usar a mesma tela do admim?
    - criar a pagina de perfil dos usuários publicos
    - na pagina do cliente se cadastrar pegar o endereço completo e verificar se vai colocar informaçoes de contato também.
    - na pagina de login/cadastro de usuarios implementar os 'aceites' de termo de uso, tanto para para cadastro de usuários.
    - na pagina de login/cadastro fazer as *validações* dos contatos conforme é selecionado pelo *tipo* sendo:'Email','Senha','contato','endereco','etc...'.

- background
    - separar os dados para armazenar localmente diferentemente dos usuários públicos e privados.





## Detalhe desse ponto desse commit

configurado as regras do firebase em:
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Clientes: cada um só acessa o próprio documento
    match /clientes/{userId} {
      allow read, write: if isSignedIn() && (isAdmin() || request.auth.uid == userId);
    }

    // Admin pode acessar tudo
    match /{document=**} {
      allow read, write: if isAdmin();
    }

    // Funções auxiliares
    function isSignedIn() {
      return request.auth != null;
    }

    function isAdmin() {
      return request.auth != null && request.auth.token.email == 'yuritakeo@ucl.br';
    }
  }
}

### Devido Ajuste para somente o email 'yuritakeo@ucl.br' poder entrar na tela admim, falta terminar a tela dashboard do cliente do admim