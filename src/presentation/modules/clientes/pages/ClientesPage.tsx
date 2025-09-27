import ClienteList from '../components/ClienteList';

const ClientesPage = () => {
  return (
    <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-4 space-y-4">
      <h1 className="text-2xl font-bold mb-4">Clientes</h1>
      <ClienteList />
    </div>
  );
};

export default ClientesPage;
