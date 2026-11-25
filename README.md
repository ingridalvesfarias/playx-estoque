# PlayX | Controle de Estoque e Vendas

Sistema web responsivo de controle de estoque, cadastro de produtos e registro de vendas em tempo real, desenvolvido com **React**, **TypeScript**, **Tailwind CSS** e **Firebase** (Authentication + Cloud Firestore).

## Funcionalidades

- **Autenticação:** acesso restrito a usuários autenticados via Firebase Authentication.
- **Gestão de produtos:** cadastro de novos itens, edição de nome/preço, reposição de estoque e desativação lógica (`ativo: false`) sem quebrar o histórico passado.
- **Registro de vendas atômico:** utiliza `runTransaction` do Firestore para ler o estoque atualizado no servidor, impedir venda acima do saldo disponível, descontar a quantidade e registrar a venda na mesma transação.
- **Formas de pagamento:** Pix, Dinheiro, Cartão de débito, Cartão de crédito e Boleto.
- **Painel e histórico em tempo real:** total vendido no mês atual, contagem de vendas, produtos ativos, unidades em estoque e histórico atualizado automaticamente via `onSnapshot`.
- **Layout responsivo:** adaptado para celular, tablet e desktop.

## Decisões técnicas e segurança

- **Preços em centavos:** todos os valores monetários são armazenados como inteiros em centavos e formatados na interface com `Intl.NumberFormat('pt-BR')`, evitando erros de arredondamento de ponto flutuante.
- **Firestore Security Rules (`firestore.rules`):** validação no servidor exigindo usuário autenticado, tipos e campos permitidos, `precoVenda > 0`, `quantidadeEstoque >= 0`, bloqueio de exclusão em `produtos` e imutabilidade (`update`/`delete` bloqueados) na coleção `vendas`.

## Tecnologias

- React + TypeScript + Vite
- Tailwind CSS v4
- Firebase (Authentication e Cloud Firestore)

## Como rodar localmente

1. Instale as dependências:

```bash
npm install
```

2. Crie o arquivo `.env.local` a partir do `.env.example` e preencha com as credenciais do seu projeto Firebase:

```bash
cp .env.example .env.local
```

3. No **Firebase Console**, ative **Authentication (E-mail/Senha)** e **Cloud Firestore**, e publique as regras do arquivo `firestore.rules` na aba **Regras** do Firestore.

4. Inicie o servidor de desenvolvimento:

```bash
npm run dev
```

## Scripts disponíveis

- `npm run dev` — inicia o servidor de desenvolvimento
- `npm run build` — verifica tipos com TypeScript e gera o bundle de produção
- `npm run lint` — executa o ESLint
- `npm run preview` — pré-visualiza o build de produção localmente
