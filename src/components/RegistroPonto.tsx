import React, { useState } from "react";
import styled from "styled-components";
import { usePonto } from "../contexts/PontoContext";

const Container = styled.div`
  max-width: 700px;
  margin: 2rem auto;
  padding: 20px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 10px 30px rgb(0 0 0 / 0.1);
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const Title = styled.h2`
  margin-bottom: 1.5rem;
  color: #333;
  text-align: center;
  font-weight: 700;
`;

const Form = styled.form`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem 2rem;

  @media (max-width: 480px) {
    grid-template-columns: 1fr;
  }
`;

const Input = styled.input`
  padding: 12px 15px;
  font-size: 1rem;
  border-radius: 8px;
  border: 1.5px solid #ddd;
  transition: border-color 0.3s ease;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 8px #2563ebaa;
  }
`;

const Button = styled.button`
  grid-column: span 2;
  padding: 14px 0;
  background-color: #2563eb;
  border: none;
  border-radius: 10px;
  font-size: 1.1rem;
  color: white;
  font-weight: 600;
  cursor: pointer;
  transition: background-color 0.25s ease;

  &:hover {
    background-color: #1e40af;
  }

  @media (max-width: 480px) {
    grid-column: span 1;
  }
`;

const SearchInput = styled(Input)`
  margin-bottom: 1.5rem;
  grid-column: span 2;

  @media (max-width: 480px) {
    grid-column: span 1;
  }
`;

const ListContainer = styled.div`
  margin-top: 30px;
  overflow-x: auto;
`;

const ListTitle = styled.h3`
  margin-bottom: 1rem;
  color: #444;
  font-weight: 600;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  box-shadow: 0 0 8px rgb(0 0 0 / 0.05);
  min-width: 600px;

  @media (max-width: 600px) {
    min-width: 100%;
  }
`;

const Th = styled.th`
  text-align: left;
  padding: 12px 15px;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 12px 15px;
  border-bottom: 1px solid #eee;
  white-space: nowrap;
`;

const NoRecords = styled.p`
  text-align: center;
  color: #999;
  margin-top: 20px;
`;

const ActionButton = styled.button`
  margin-right: 8px;
  padding: 6px 10px;
  background-color: #2563eb;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;

  &:last-child {
    background-color: #dc2626;
  }

  &:hover {
    filter: brightness(0.9);
  }
`;

const RegistroPonto: React.FC = () => {
  const { adicionarPonto, pontos, excluirPonto, atualizarPonto } = usePonto();

  const [nome, setNome] = useState("");
  const [data, setData] = useState("");
  const [entrada, setEntrada] = useState("");
  const [saida, setSaida] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [editId, setEditId] = useState<string | null>(null);

  const limparCampos = () => {
    setNome("");
    setData("");
    setEntrada("");
    setSaida("");
    setEditId(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!nome || !data || !entrada || !saida) {
      alert("Preencha todos os campos.");
      return;
    }

    const novoRegistro = {
      funcionarioId: nome + data,
      nome,
      data,
      entrada,
      saida,
    };

    try {
      if (editId) {
        await atualizarPonto(editId, novoRegistro);
      } else {
        await adicionarPonto(novoRegistro);
      }
      limparCampos();
    } catch (error) {
      alert("Erro ao salvar registro");
      console.error(error);
    }
  };

  const iniciarEdicao = (id: string) => {
    const ponto = pontos.find((p) => p.id === id);
    if (ponto) {
      setNome(ponto.nome);
      setData(ponto.data);
      setEntrada(ponto.entrada);
      setSaida(ponto.saida);
      setEditId(id);
    }
  };

  const handleExcluir = async (id: string) => {
    if (window.confirm("Tem certeza que deseja excluir este registro?")) {
      try {
        await excluirPonto(id);
      } catch (error) {
        alert("Erro ao excluir registro");
        console.error(error);
      }
    }
  };

  const filteredPontos = pontos.filter((p) =>
    p.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Container>
      <Title>Registro de Ponto</Title>

      <SearchInput
        type="text"
        placeholder="Buscar por nome do funcionário..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <Form onSubmit={handleSubmit}>
        <Input
          type="text"
          placeholder="Nome do Funcionário"
          value={nome}
          onChange={(e) => setNome(e.target.value)}
        />
        <Input
          type="date"
          value={data}
          onChange={(e) => setData(e.target.value)}
        />
        <Input
          type="time"
          value={entrada}
          onChange={(e) => setEntrada(e.target.value)}
        />
        <Input
          type="time"
          value={saida}
          onChange={(e) => setSaida(e.target.value)}
        />
        <Button type="submit">
          {editId ? "Atualizar Registro" : "Registrar Ponto"}
        </Button>
      </Form>

      <ListContainer>
        <ListTitle>Registros</ListTitle>
        {filteredPontos.length === 0 ? (
          <NoRecords>Nenhum registro encontrado.</NoRecords>
        ) : (
          <Table>
            <thead>
              <tr>
                <Th>Funcionário</Th>
                <Th>Data</Th>
                <Th>Entrada</Th>
                <Th>Saída</Th>
                <Th>Ações</Th>
              </tr>
            </thead>
            <tbody>
              {filteredPontos.map((ponto) => (
                <tr key={ponto.id}>
                  <Td>{ponto.nome}</Td>
                  <Td>{ponto.data}</Td>
                  <Td>{ponto.entrada}</Td>
                  <Td>{ponto.saida}</Td>
                  <Td>
                    <ActionButton onClick={() => iniciarEdicao(ponto.id)}>
                      Editar
                    </ActionButton>
                    <ActionButton onClick={() => handleExcluir(ponto.id)}>
                      Excluir
                    </ActionButton>
                  </Td>
                </tr>
              ))}
            </tbody>
          </Table>
        )}
      </ListContainer>
    </Container>
  );
};

export default RegistroPonto;
