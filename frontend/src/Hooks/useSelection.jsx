import { useState } from "react";

const useSelection = () => {
  const [selected, setSelected] = useState([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleSelectOne = (id) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  };

  const handleSelectAll = (visibleItems) => {
    if (selectAll) {
      setSelected([]);
      setSelectAll(false);
    } else {
      setSelected(visibleItems.map((item) => item._id));
      setSelectAll(true);
    }
  };

  return { selected, selectAll, handleSelectOne, handleSelectAll, setSelectAll, setSelected };
};

export default useSelection;
