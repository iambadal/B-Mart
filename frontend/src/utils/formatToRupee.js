
const formatToRupee = (price) => {
    let Rupee = new Intl.NumberFormat("en-IN", {
        style: "currency",
        currency: "INR",
    });

  return Rupee.format(price);
}

export default formatToRupee