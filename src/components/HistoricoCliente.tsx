// src/components/HistoricoCliente.tsx

import React from "react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react"; // ícone moderno
import "bootstrap/dist/css/bootstrap.min.css";

interface HistoricoClienteProps {
    clienteNome: string;
    onNovaVenda: () => void;
    historico: { id: string; descricao: string; data: string; valor: number }[];
}

const HistoricoCliente: React.FC<HistoricoClienteProps> = ({
    clienteNome,
    onNovaVenda,
    historico,
}) => {
    return (
        <div className="container my-3">
            {/* Cabeçalho fixo */}
            <motion.div
                className="bg-light shadow-sm d-flex justify-content-between align-items-center p-3 sticky-top"
                initial={{ y: -50, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.4 }}
            >
                <h5 className="m-0">Histórico de {clienteNome}</h5>
                <button className="btn btn-primary d-flex align-items-center gap-2" onClick={onNovaVenda}>
                    <PlusCircle size={18} />
                    Nova venda
                </button>
            </motion.div>

            {/* Lista do histórico */}
            <div className="mt-3">
                {historico.length === 0 ? (
                    <p className="text-muted text-center">Nenhum histórico encontrado.</p>
                ) : (
                    <ul className="list-group">
                        {historico.map((item) => (
                            <motion.li
                                key={item.id}
                                className="list-group-item d-flex justify-content-between align-items-center"
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3 }}
                            >
                                <div>
                                    <strong>{item.descricao}</strong>
                                    <div className="text-muted small">{item.data}</div>
                                </div>
                                <span className="badge bg-success">
                                    R$ {item.valor.toFixed(2)}
                                </span>
                            </motion.li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default HistoricoCliente;