import { useEffect, useState } from 'react';
import { getData } from './AJAX/GetData';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch'; 
import './App.css';

import 'primereact/resources/themes/lara-light-indigo/theme.css'; // Theme
import 'primereact/resources/primereact.min.css';                 // this is for core css.
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
  const [tableData, setTableData] = useState<RowData[]>([]);;  // State to store the data
  const [totalRecords, setTotalRecords] = useState(0);  // State to manage total records
  const [page, setPage] = useState(1);             // State to track current page
  const [selectedProducts, setSelectedProducts] =  useState<RowData[]>([]); // State to track all selected rows across pages
  const [rowClick, setRowClick] = useState(false); // State for row click toggle
  
  const fields = [
    { field: 'title', header: 'Title' },
    { field: 'place_of_origin', header: 'Place of Origin' },
    { field: 'artist_display', header: 'Artist' },
    { field: 'inscriptions', header: 'Inscriptions' },
    { field: 'date_start', header: 'Date Start' },
    { field: 'date_end', header: 'Date End' }
  ];

  // Function to fetch data for a specific page
  const fetchData = async (page:number) => {
    try {
      const result = await getData(page);  // Fetch the data for the current page
      setTableData(result.data);           // Store the result in state
      setTotalRecords(result.pagination.total);  // Set total records (assuming the API provides pagination info)
    } catch (error) {
      console.error('Error fetching data:', error);
    } 
  };

  // Fetch data when the component is mounted or the page changes
  useEffect(() => {
    fetchData(page);
  }, [page]);

  // Handle page change event from DataTable
  const onPageChange = (event:any) => {
    setPage(event.page + 1);  // PrimeReact uses zero-based index, so add 1
  };

  // Helper function to check if a row is already selected
  const isRowSelected = (rowData:any) => {
    return selectedProducts.some(item => item.id === rowData.id);
  };

  // Handle selection change to persist selected data across pages
  // e: { value: RowData[] } TypeScript cannot infer the type of selectedRow and treats it as any.
  const onSelectionChange = (e: { value: RowData[] }) => {
    const selectedRows = e.value;
    
    // Combine new selections with already selected rows from other pages
    const updatedSelectedProducts = [...selectedProducts];

    // Add or remove selected rows based on the current page's data
    tableData.forEach((row) => {
      const isSelected = selectedRows.some(selectedRow => selectedRow.id === row.id);
      const isAlreadySelected = isRowSelected(row);

      if (isSelected && !isAlreadySelected) {
        updatedSelectedProducts.push(row);
      } else if (!isSelected && isAlreadySelected) {
        const indexToRemove = updatedSelectedProducts.findIndex(item => item.id === row.id);
        if (indexToRemove !== -1) {
          updatedSelectedProducts.splice(indexToRemove, 1);
        }
      }
    });

    setSelectedProducts(updatedSelectedProducts);  // Update the state with selected rows
  };

  return (
    <>
      <div>
        {/* Add the InputSwitch for toggling rowClick */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent : 'center', marginBottom: '1rem' }}>
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
          selection={tableData.filter(row => isRowSelected(row))} // Filter selected rows for current page
          onSelectionChange={onSelectionChange} // Event handler for selection change
          dataKey="id" // Unique key for each row
          selectionMode={rowClick ? null : 'checkbox'} // Toggle selection mode based on rowClick
          tableStyle={{ minWidth: '50rem' }}
        >
          {/* Add checkbox column */}
          <Column selectionMode="multiple" headerStyle={{ width: '3rem' }}></Column>

          {/* Add your data columns */}
          {fields.map((col, index) => (
            <Column key={index} field={col.field} header={col.header}></Column>
          ))}
        </DataTable>
      </div>
    </>
  );
}

export default App;
