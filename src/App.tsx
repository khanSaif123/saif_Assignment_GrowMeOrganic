import { useEffect, useState } from 'react';
import { getData } from './AJAX/GetData';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch';
import Selectrow from './components/Selectrow';
import './App.css';

import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';                 // Core CSS
import 'primeicons/primeicons.css';

type RowData = {
  id: number;
  title: string;
  place_of_origin: string;
  artist_display: string;
  inscriptions: string;
  date_start: string;
  date_end: string;
};

function App() {
  const [tableData, setTableData] = useState<RowData[]>([]);  // Data for the current page
  const [totalRecords, setTotalRecords] = useState(0);  // Total records from the server
  const [page, setPage] = useState(1);  // Current page number
  const [selectedProducts, setSelectedProducts] = useState<RowData[]>([]);  // Global selected records
  const [rowClick, setRowClick] = useState(false);  // Row click toggle

  // Define the fields array
  const fields = [
    { field: 'title', header: 'Title' },
    { field: 'place_of_origin', header: 'Place of Origin' },
    { field: 'artist_display', header: 'Artist' },
    { field: 'inscriptions', header: 'Inscriptions' },
    { field: 'date_start', header: 'Date Start' },
    { field: 'date_end', header: 'Date End' }
  ];

  // Fetch data for the current page
  const fetchData = async (page: number) => {
    try {
      const result = await getData(page);  // Fetch the data for the current page
      setTableData(result.data);  // Set current page data
      setTotalRecords(result.pagination.total);  // Set total records
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  useEffect(() => {
    fetchData(page);  // Fetch data on page load or page change
  }, [page]);

  const onPageChange = (event: any) => {
    setPage(event.page + 1);  // PrimeReact uses zero-based index, so add 1
  };

  const isRowSelected = (rowData: RowData) => {
    return selectedProducts.some(item => item.id === rowData.id);  // Check if row is already selected globally
  };

  const onSelectionChange = (e: { value: RowData[] }) => {
    const selectedRows = e.value;
    const updatedSelectedProducts = [...selectedProducts];

    tableData.forEach((row) => {
      const isSelected = selectedRows.some(selectedRow => selectedRow.id === row.id);
      const isAlreadySelected = isRowSelected(row);

      if (isSelected && !isAlreadySelected) {
        updatedSelectedProducts.push(row);  // Add new selected row to global state
      } else if (!isSelected && isAlreadySelected) {
        const indexToRemove = updatedSelectedProducts.findIndex(item => item.id === row.id);
        if (indexToRemove !== -1) {
          updatedSelectedProducts.splice(indexToRemove, 1);  // Remove deselected row
        }
      }
    });

    setSelectedProducts(updatedSelectedProducts);  // Update global selected rows state
  };

  const handleSelectRows = async (count: number) => {
    let rowsToSelect = [...selectedProducts]; // Start with already selected rows
    let rowsNeeded = count - rowsToSelect.length; // Calculate how many rows to fetch
  
    if (rowsNeeded < 0) {
      // If we need to reduce the selection
      rowsToSelect = rowsToSelect.slice(0, count); // Keep only the required number of rows
    } else {
      // If we need to increase the selection
      let currentPage = page;
  
      while (rowsNeeded > 0) {
        const result = await getData(currentPage);
        const currentPageData = result.data;
  
        const rowsFromPage = currentPageData.slice(0, rowsNeeded); // Select only needed number of rows
        rowsToSelect.push(...rowsFromPage); // Add new rows to selection
  
        rowsNeeded -= rowsFromPage.length; // Decrease the remaining rows needed
        currentPage += 1; // Move to the next page
      }
    }
  
    setSelectedProducts([...new Set(rowsToSelect)]); // Update global selected rows, ensuring uniqueness
  };
  

  return (
    <>
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1rem' }}>
          <InputSwitch checked={rowClick} onChange={(e) => setRowClick(e.value)} />
          <span style={{ marginLeft: '10px' }}>Row Click</span>
        </div>

        <DataTable 
          value={tableData}
          paginator
          rows={12}
          totalRecords={totalRecords}
          lazy
          first={(page - 1) * 12}
          onPage={onPageChange}
          selection={selectedProducts}  // Use global selectedProducts for selection
          onSelectionChange={onSelectionChange} 
          dataKey="id"
          selectionMode={rowClick ? null : 'checkbox'} 
          tableStyle={{ minWidth: '50rem' }}
        >
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>
          
          {/* Use the Selectrow component for the Title column header */}
          <Column field="title" header={<Selectrow onSelectRows={handleSelectRows} />}></Column>
          
          {fields.slice(1).map((col, index) => (
            <Column key={index} field={col.field} header={col.header}></Column>
          ))}
        </DataTable>
      </div>
    </>
  );
}

export default App;
