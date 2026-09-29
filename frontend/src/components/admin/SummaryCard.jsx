
const SummaryCard = ({ title, count, icon, classNames }) => {
  const Icon = icon;
  return (
    <div
      className={` relative w-full max-w-[190px] h-fit font-funnel p-4 rounded-3xl space-y-1 shadow ${classNames}`}
    >
      <h1 className=" text-2xl font-bold">{count}</h1>
      <div className=" flex items-center justify-between gap-1">
        <p>{title}</p>
        <Icon size={24} />
      </div>
    </div>
  );
};

export default SummaryCard;
