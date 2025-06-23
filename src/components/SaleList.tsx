import React, { useState } from "react";
import styled from "styled-components";
import { useSales, Sale } from "../contexts/SalesContext";

const Container = styled.div`
  max-width: 900px;
  margin: 2rem auto;
  font-family: "Segoe UI", Tahoma, Geneva, Verdana, sans-serif;
`;

const Header = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 1rem;
  margin-bottom: 1rem;
  align-items: center;
`;

const Input = styled.input`
  padding: 8px 12px;
  font-size: 1rem;
  border-radius: 6px;
  border: 1.5px solid #ccc;
  outline: none;
  min-width: 160px;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 5px #2563ebaa;
  }
`;

const Button = styled.button<{ variant?: "add" | "edit" | "delete" }>`
  background-color: ${(p) =>
    p.variant === "add"
      ? "#22c55e"
      : p.variant === "delete"
      ? "#ef4444"
      : p.variant === "edit"
      ? "#3b82f6"
      : "#999"};
  color: white;
  border: none;
  padding: 8px 14px;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: background-color 0.3s ease;

  &:hover {
    background-color: ${(p) =>
      p.variant === "add"
        ? "#16a34a"
        : p.variant === "delete"
        ? "#dc2626"
        : p.variant === "edit"
        ? "#2563eb"
        : "#666"};
  }
`;

const DaySection = styled.div`
  margin-bottom: 2rem;
  padding: 1rem;
  border: 1px solid #ddd;
  border-radius: 10px;
  background: #f9fafb;
`;

const DayHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
`;

const DayTitle = styled.h3`
  margin: 0;
  font-weight: 700;
  color: #2563eb;
`;

const TotalLabel = styled.div`
  font-weight: 600;
  color: #111827;
  font-size: 1.1rem;
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  min-width: 320px;
`;

const Th = styled.th`
  text-align: left;
  padding: 10px 15px;
  background-color: #2563eb;
  color: white;
  font-weight: 600;
  white-space: nowrap;
`;

const Td = styled.td`
  padding: 10px 15px;
  border-bottom: 1px solid #ddd;
  white-space: nowrap;
`;

const ActionButton = styled.button`
  margin-right: 8px;
  padding: 5px 10px;
  background-color: #2563eb;
  border: none;
  color: white;
  border-radius: 6px;
  cursor: pointer;
  font-size: 0.9rem;

  &:last-child {
    background-color: #ef4444;
  }

  &:hover {
    filter: brightness(0.9);
  }
`;

const EditInput = styled.input`
  width: 80px;
  padding: 6px 10px;
  font-size: 1rem;
  border: 1px solid #ccc;
  border-radius: 6px;
  outline: none;

  &:focus {
    border-color: #2563eb;
    box-shadow: 0 0 6px #2563ebaa;
  }
`;

interface SalesByDayGroup {
  day: string; // 'YYYY-MM-DD'
  sales: Sale[];
}

const SalesByDay: React.FC = () => {
  const { sales, deleteSale, editSale } = useSales();

  // Agrupar vendas por dia (YYYY-MM-DD)
  const groupSalesByDay = (): SalesByDayGroup[] => {
    const groups: { [key: string]: Sale[] } = {};

    sales.forEach((sale) => {
      const dayKey = sale.createdAt.toISOString().slice(0, 10);
      if (!groups[dayKey]) groups[dayKey] = [];
      groups[dayKey].push(sale);
    });

    // Ordena por data desc
    return Object.entries(groups)
      .map(([day, sales]) => ({ day, sales }))
      .sort((a, b) => (a.day < b.day ? 1 : -1));
  };

  const [salesByDay, setSalesByDay] = useState<SalesByDayGroup[]>(
    groupSalesByDay()
  );
  const [searchDay, setSearchDay] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState<string>("");

  // Atualiza estado quando "sales" mudar (vindo do contexto)
  React.useEffect(() => {
    setSalesByDay(groupSalesByDay());
  }, [sales]);

  const filteredSalesByDay = salesByDay.filter((group) =>
    group.day.includes(searchDay)
  );

  // Edit inline
  const startEditing = (sale: Sale) => {
    setEditingId(sale.id);
    setEditValue(sale.value.toString());
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditValue("");
  };

  const saveEditing = async () => {
    if (editingId && !isNaN(Number(editValue)) && Number(editValue) >= 0) {
      await editSale(editingId, Number(editValue));
      cancelEditing();
    } else {
      alert("Digite um valor válido para salvar.");
    }
  };

  // Adiciona novo dia (hoje com vendas vazias)
  const adicionarDia = () => {
    const hoje = new Date().toISOString().slice(0, 10);
    // Se já existir, só foca no input do filtro
    if (salesByDay.find((g) => g.day === hoje)) {
      alert("Já existe registro para o dia de hoje.");
      setSearchDay(hoje);
      return;
    }
    setSalesByDay([{ day: hoje, sales: [] }, ...salesByDay]);
    setSearchDay(hoje);
  };

  // Formatar data para exibir corretamente localmente
  const formatDay = (day: string) => {
    const [year, month, dayOfMonth] = day.split("-");
    const d = new Date(Number(year), Number(month) - 1, Number(dayOfMonth));
    return d.toLocaleDateString();
  };

  return (
    <Container>
      <Header>
        <Button variant="add" onClick={adicionarDia}>
          + Novo Dia
        </Button>
        <Input
          type="date"
          value={searchDay}
          onChange={(e) => setSearchDay(e.target.value)}
          placeholder="Filtrar por dia"
        />
      </Header>

      {filteredSalesByDay.length === 0 && (
        <p>Nenhum registro encontrado para o dia selecionado.</p>
      )}

      {filteredSalesByDay.map(({ day, sales }) => {
        const total = sales.reduce((acc, curr) => acc + curr.value, 0);

        return (
          <DaySection key={day}>
            <DayHeader>
              <DayTitle>{formatDay(day)}</DayTitle>
              <TotalLabel>Total: R$ {total.toFixed(2)}</TotalLabel>
            </DayHeader>

            {sales.length === 0 && (
              <p style={{ color: "#666" }}>
                Nenhuma venda registrada nesse dia.
              </p>
            )}

            {sales.length > 0 && (
              <Table>
                <thead>
                  <tr>
                    <Th>#</Th>
                    <Th>Valor (R$)</Th>
                    <Th>Data e Hora</Th>
                    <Th>Ações</Th>
                  </tr>
                </thead>
                <tbody>
                  {sales
                    .sort(
                      (a, b) => a.createdAt.getTime() - b.createdAt.getTime()
                    )
                    .map((sale, i) => (
                      <tr key={sale.id}>
                        <Td>{i + 1}</Td>

                        <Td>
                          {editingId === sale.id ? (
                            <EditInput
                              type="number"
                              min="0"
                              step="0.01"
                              value={editValue}
                              onChange={(e) => setEditValue(e.target.value)}
                              autoFocus
                            />
                          ) : (
                            sale.value.toFixed(2)
                          )}
                        </Td>

                        <Td>{sale.createdAt.toLocaleTimeString()}</Td>

                        <Td>
                          {editingId === sale.id ? (
                            <>
                              <Button onClick={saveEditing} variant="edit">
                                Salvar
                              </Button>
                              <Button onClick={cancelEditing} variant="delete">
                                Cancelar
                              </Button>
                            </>
                          ) : (
                            <>
                              <ActionButton onClick={() => startEditing(sale)}>
                                Editar
                              </ActionButton>
                              <ActionButton
                                onClick={() => {
                                  if (
                                    window.confirm(
                                      "Tem certeza que deseja excluir esta venda?"
                                    )
                                  ) {
                                    deleteSale(sale.id);
                                  }
                                }}
                              >
                                Excluir
                              </ActionButton>
                            </>
                          )}
                        </Td>
                      </tr>
                    ))}
                </tbody>
              </Table>
            )}
          </DaySection>
        );
      })}
    </Container>
  );
};

export default SalesByDay;
