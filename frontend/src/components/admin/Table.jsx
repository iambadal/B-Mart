const Table = ({
  columns, // Array of header names..
  rows, // Array of  data.
  renderRows, // Function that builds each <tr>.
  lastRowRef = null, // Optionally to use the infinite scroll (put on the last <tr>).
  checkbox

}) => {
  return (
    <table className=" min-w-max w-full table-auto ring ring-gray-600/60 rounded-md ">
      <thead>
        <tr className="bg-gray-600/15">
          {checkbox && <th className="p-4">{checkbox}</th>}
          {columns.map((col, idx) => (
            <th key={idx} className="p-4 text-lg max-sm:text-base" >{col}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => {
          const isLastRow = idx === rows.length - 1 && rows.length > 0; // detect last row.
          return renderRows(row, idx, isLastRow ? lastRowRef : null);
        })}
      </tbody>
    </table>
  );
};

export default Table;
