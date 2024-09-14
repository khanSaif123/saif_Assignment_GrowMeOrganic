import { OverlayPanel } from 'primereact/overlaypanel';
import React, { useRef, useState } from 'react';

interface SelectRowProps {
  onSelectRows: (count: number) => void; // Prop for sending the selected number to the parent component
}

const Selectrow: React.FC<SelectRowProps> = ({ onSelectRows }) => {
  const op = useRef<OverlayPanel>(null); // Initialize the ref for OverlayPanel
  const [inputValue, setInputValue] = useState<string>(''); // State to store input value as string

  const handleSelect = () => {
    const numericValue = Number(inputValue); // Convert string to number
    // Call the parent function with the numeric value
    if (!isNaN(numericValue)) {
      onSelectRows(numericValue); 
    }
    op.current?.hide(); // Hide the OverlayPanel after selection
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow only numeric values and empty string
    if (value) {
      setInputValue(value);
    }
  };

  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      {/* Chevron down icon instead of button */}
      <i
        className="pi pi-chevron-down" // PrimeIcon for chevron down
        style={{ cursor: 'pointer', fontSize: '1.2rem', marginRight: '10px' }}
        onClick={(e) => op.current?.toggle(e)} // Toggle the overlay panel on click
      ></i>
      
      {/* Overlay panel */}
      <OverlayPanel ref={op}>
        <div
          style={{
            height: "80px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            flexDirection: "column",
            gap: "20px"
          }}
        >
          <input
            type="text" value={inputValue} onChange={handleChange}/>
          
          <button
            style={{ width: "80%", padding: "5px", textAlign: "center" }}
            onClick={handleSelect}>
            Enter to select
          </button>
        </div>
      </OverlayPanel>
      
      {/* Title text */}
      <span style={{ marginLeft: '10px' }}>Title</span>
    </div>
  );
};

export default Selectrow;
