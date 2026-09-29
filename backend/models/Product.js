import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    rating: { type: Number, required: true, min: 0, max: 5 },
    title: { type: String, required: true },
    comment: { type: String },
    createdAt: { type: Date, default: Date.now },
},
    { _id: true }
);

const metadataSchema = new mongoose.Schema({
    dimensions: {
        width: { type: Number, required: false },
        height: { type: Number, required: false },
        depth: { type: Number, required: false },
    },
    weight: { type: Number },
    color: { type: String },
    extra: { type: Map, of: mongoose.Schema.Types.Mixed }
}, { _id: false });

const productSchema = new mongoose.Schema({
    name: { type: String, required: [true, "Name is required"], trim: true },
    slug: { type: String, index: true },
    description: { type: String, default: "" },
    price: { type: Number, required: true, min: 0 },
    category: { type: String, index: true },
    tags: [{ type: String, index: true }],
    images: [{
        url: { type: String, required: true },
        public_id: { type: String, required: true },
    }],
    stock: { type: Number, default: 0, min: 0 },
    sku: { type: String, unique: false, sparse: true },
    rating: { type: Number, default: 0 },
    numReviews: { type: Number, default: 0 },
    reviews: [reviewSchema],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    questionAnswer: [{ question: { type: String, default: "" }, answer: { type: String, default: "" } }],
    metadata: metadataSchema,
    status: { type: String, default: "" },
}, { timestamps: true }
);

// Text index for search across name + description + tags
productSchema.index({ name: "text", description: "text", tags: "text" })

// Auto-generate unique slug before save
productSchema.pre('save', async function (next) {
    if (this.isModified("name")) {
        let baseSlug = slugify(this.name, { lower: true, strict: true });
        let slug = baseSlug;
        let count = 1;

        // Check if slug already exists in DB
        while (await mongoose.models.Product.findOne({ slug })) {
            slug = `${baseSlug}-${count++}`;
        }
        this.slug = slug;
    }
    next();
});

export default mongoose.model("Product", productSchema);



