import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { api } from "../services/api";
import { getProductImage } from "../utils/imageHelpers";
import type { AdminProductImage, ApiProduct, PrintAreaConfig } from "../types";
import "../styles/admin.css";
import "../styles/admin-colors.css";

type Side = "FRONT" | "BACK";
type Area = {
  x: number;
  y: number;
  width: number;
  height: number;
  enabled: boolean;
};
const defaultArea: Area = {
  x: 0.27,
  y: 0.165,
  width: 0.46,
  height: 0.66,
  enabled: true,
};
const baseColors = [
  ["Black", "#000000"],
  ["White", "#ffffff"],
  ["Gray", "#6b7280"],
  ["Navy", "#172554"],
  ["Red", "#dc2626"],
  ["Green", "#16a34a"],
  ["Pink", "#ec4899"],
  ["Sky Blue", "#38bdf8"],
];

export default function AdminProductEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isNewProduct = !id;
  const [product, setProduct] = useState<
    | (ApiProduct & {
        productImages: AdminProductImage[];
        printAreas: PrintAreaConfig[];
      })
    | null
  >(null);
  const [productName, setProductName] = useState("");
  const [productSlug, setProductSlug] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productType, setProductType] = useState("OTHER");
  const [productCategoryId, setProductCategoryId] = useState("");
  const [supportsDoublePrint, setSupportsDoublePrint] = useState(false);
  const [categories, setCategories] = useState<Array<{ id: string; name: string }>>([]);
  const [productTypes, setProductTypes] = useState<Array<{ id: string; name: string }>>([]);
  const [coverPhoto, setCoverPhoto] = useState("");
  const [color, setColor] = useState("");

  // Auto-generate slug from product name
  const handleNameChange = (name: string) => {
    setProductName(name);
    // Auto-generate slug: lowercase, replace spaces with hyphens, remove special chars
    const autoSlug = name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-');
    setProductSlug(autoSlug);
  };
  const [side, setSide] = useState<Side>("FRONT");
  const [description, setDescription] = useState("");
  const [sizeChartImage, setSizeChartImage] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [fileName, setFileName] = useState("");
  const [variantIds, setVariantIds] = useState<string[]>([]);
  const [newColor, setNewColor] = useState("");
  const [newColorHex, setNewColorHex] = useState("#111111");
  const [selectedBaseHex, setSelectedBaseHex] = useState<string | null>(null);
  const [newColorSizes, setNewColorSizes] = useState<string[]>([]);
  const [editingColorSizes, setEditingColorSizes] = useState<Record<string, string[]>>({});

  // Helper to sort sizes in proper order
  const sortSizes = (sizes: string[]): string[] => {
    const order = { "XS": 0, "S": 1, "M": 2, "L": 3, "XL": 4, "XXL": 5, "XXXL": 6 };
    return [...sizes].sort((a, b) => (order[a as keyof typeof order] || 999) - (order[b as keyof typeof order] || 999));
  };

  const [areas, setAreas] = useState<Record<Side, Area>>({
    FRONT: defaultArea,
    BACK: defaultArea,
  });
  const [message, setMessage] = useState("");
  const draftImagesRef = useRef<
    Record<string, { url: string; fileName: string }>
  >({});
  const stageRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<{
    mode: "move" | "resize";
    startX: number;
    startY: number;
    area: Area;
  } | null>(null);

  const loadCategories = () =>
    api.getCategories()
      .then((response) => {
        setCategories(response.data.categories);
      })
      .catch(() => setMessage("Could not load categories."));

  const loadProductTypes = () =>
    api.getProductTypes()
      .then((response) => {
        setProductTypes(response.data.productTypes);
      })
      .catch(() => setMessage("Could not load product types."));

  const loadProduct = () =>
    api.getAdminProduct(id!).then((response) => {
      const loaded = response.data.product;
      setProduct(loaded);
      setProductName(loaded.name);
      setProductSlug(loaded.slug);
      setProductPrice(String(loaded.price));
      setProductType(loaded.type);
      setProductCategoryId(loaded.categoryId);
      setSupportsDoublePrint(loaded.supportsDoublePrint);
      setDescription(loaded.description || "");
      setSizeChartImage(loaded.sizeChartImage || "");
      setCoverPhoto(loaded.images?.[0] || "");
      setColor((previous) => previous || loaded.variants[0]?.color || "");
      setAreas({
        FRONT:
          loaded.printAreas.find((area) => area.side === "FRONT") ||
          defaultArea,
        BACK:
          loaded.printAreas.find((area) => area.side === "BACK") || defaultArea,
      });
    });

  useEffect(() => {
    loadCategories();
    loadProductTypes();
    if (isNewProduct) {
      setNewColorSizes(["S"]);
      setColor(newColor || "Black");
    } else {
      loadProduct().catch(() => setMessage("Could not load this product."));
    }
  }, [id]);

  const colors = useMemo(
    () => [...new Set(product?.variants.map((variant) => variant.color) || [])],
    [product],
  );
  const currentImage = product?.productImages.find(
    (image) => image.color === color && image.side === side,
  );
  const hasDraftImage = Boolean(draftImagesRef.current[`${color}:${side}`]);
  const currentArea = areas[side];
  const variantsForColor =
    product?.variants.filter((variant) => variant.color === color) || [];
  const allSizes = useMemo(
    () => {
      if (isNewProduct) {
        return ['S', 'M', 'L', 'XL', 'XXL'];
      }
      const existingSizes = [...new Set(product?.variants.map((variant) => variant.size) || [])];
      // Ensure standard sizes are always available
      const standardSizes = ['S', 'M', 'L', 'XL', 'XXL'];
      const allUniqueSizes = [...new Set([...existingSizes, ...standardSizes])];
      // Sort by size order
      const sizeOrder = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL'];
      return allUniqueSizes.sort((a, b) => {
        const aIndex = sizeOrder.indexOf(a);
        const bIndex = sizeOrder.indexOf(b);
        if (aIndex === -1) return 1;
        if (bIndex === -1) return -1;
        return aIndex - bIndex;
      });
    },
    [product, isNewProduct],
  );

  useEffect(() => {
    const draft = draftImagesRef.current[`${color}:${side}`];
    setImageUrl(
      draft?.url ||
        currentImage?.url ||
        getProductImage(
          product?.slug || "",
          color,
          side.toLowerCase() as "front" | "back",
        ),
    );
    setFileName(draft?.fileName || currentImage?.fileName || "");
    setVariantIds(
      currentImage?.variants.map((link) => link.variantId) ||
        variantsForColor.map((variant) => variant.id),
    );
  }, [color, side, product]);

  const updateAreaFromPointer = (event: PointerEvent<HTMLElement>) => {
    const stage = stageRef.current;
    const drag = dragRef.current;
    if (!stage || !drag) return;
    const rect = stage.getBoundingClientRect();
    const dx = (event.clientX - drag.startX) / rect.width;
    const dy = (event.clientY - drag.startY) / rect.height;
    const next = { ...drag.area };
    if (drag.mode === "move") {
      next.x = Math.max(0, Math.min(1 - next.width, drag.area.x + dx));
      next.y = Math.max(0, Math.min(1 - next.height, drag.area.y + dy));
    } else {
      next.width = Math.max(0.08, Math.min(1 - next.x, drag.area.width + dx));
      next.height = Math.max(0.08, Math.min(1 - next.y, drag.area.height + dy));
    }
    setAreas((previous) => ({ ...previous, [side]: next }));
  };
  const startAreaDrag = (
    mode: "move" | "resize",
    event: PointerEvent<HTMLElement>,
  ) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      mode,
      startX: event.clientX,
      startY: event.clientY,
      area: currentArea,
    };
  };
  const stopAreaDrag = () => {
    dragRef.current = null;
  };
  const handleUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const url = String(reader.result);
      draftImagesRef.current[`${color}:${side}`] = { url, fileName: file.name };
      setFileName(file.name);
      setImageUrl(url);
    };
    reader.readAsDataURL(file);
  };
  const toggleVariant = (variantId: string) =>
    setVariantIds((previous) =>
      previous.includes(variantId)
        ? previous.filter((id) => id !== variantId)
        : [...previous, variantId],
    );
  const createProduct = async () => {
    if (!productName || !productSlug || !productPrice || !productCategoryId || !newColor || !newColorSizes.length) {
      setMessage('Complete all product details and choose at least one size for the first color.');
      return;
    }
    try {
      const response = await api.createAdminProduct({
        name: productName,
        slug: productSlug,
        description,
        price: Number(productPrice),
        categoryId: productCategoryId,
        type: productType,
        supportsDoublePrint: supportsDoublePrint,
        images: coverPhoto ? [coverPhoto] : [],
        variants: [{ color: newColor, colorHex: newColorHex, sizes: newColorSizes }]
      });
      const createdProductId = response.data.product.id;

      // Save images and print areas if configured
      const images = [];
      for (const [key, draft] of Object.entries(draftImagesRef.current)) {
        const [draftColor, draftSide] = key.split(':');
        images.push({
          color: draftColor,
          side: draftSide as Side,
          url: draft.url,
          fileName: draft.fileName,
          variantIds: [], // Will be assigned by backend to all variants of this color
        });
      }

      if (images.length > 0 || areas.FRONT.enabled || areas.BACK.enabled) {
        await api.saveAdminProductDesign(createdProductId, {
          images,
          printAreas: (["FRONT", "BACK"] as Side[]).map((currentSide) => ({
            side: currentSide,
            ...areas[currentSide],
          })),
        });
      }

      navigate(`/admin/products/${createdProductId}`);
      setMessage('Product created successfully.');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : 'Could not create product.');
    }
  };

  const save = async () => {
    if (!product || !color) return;
    const images = product.productImages
      .filter((image) => !(image.color === color && image.side === side))
      .map((image) => ({
        color: image.color,
        side: image.side,
        url: image.url,
        fileName: image.fileName || undefined,
        variantIds: image.variants.map((link) => link.variantId),
      }));
    if (imageUrl)
      images.push({ color, side, url: imageUrl, fileName, variantIds });
    await api.updateAdminProduct(product.id, {
      name: productName,
      slug: productSlug,
      description,
      sizeChartImage,
      price: Number(productPrice),
      type: productType,
      categoryId: productCategoryId,
      supportsDoublePrint: product.supportsDoublePrint,
      images: coverPhoto ? [coverPhoto] : [],
    });
    await api.saveAdminProductDesign(product.id, {
      images,
      printAreas: (["FRONT", "BACK"] as Side[]).map((currentSide) => ({
        side: currentSide,
        ...areas[currentSide],
      })),
    });
    delete draftImagesRef.current[`${color}:${side}`];
    await loadProduct();
    setMessage("Saved successfully.");
  };
  const addColorVariant = async () => {
    if (!product || !newColor.trim() || !newColorSizes.length) {
      setMessage("Enter a unique color name and choose at least one size.");
      return;
    }
    if (
      colors.some(
        (value) => value.toLowerCase() === newColor.trim().toLowerCase(),
      )
    ) {
      setMessage("A color with this name already exists.");
      return;
    }
    try {
      await api.addAdminProductVariantColor(product.id, {
        color: newColor.trim(),
        colorHex: newColorHex,
        sizes: newColorSizes,
      });
      await loadProduct();
      setColor(newColor.trim());
      setNewColor("");
      setNewColorSizes([]);
      setMessage("Color variant added.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not add this color.",
      );
    }
  };
  const handleNewColorHexChange = (value: string) => {
    setNewColorHex(value);
    if (
      selectedBaseHex &&
      selectedBaseHex.toLowerCase() !== value.toLowerCase()
    ) {
      setNewColor("");
      setSelectedBaseHex(null);
    }
  };
  const deleteCurrentImage = async () => {
    const draftKey = `${color}:${side}`;

    // Delete from draft if it exists
    if (draftImagesRef.current[draftKey]) {
      delete draftImagesRef.current[draftKey];
    }

    // Delete from server if it's a saved image
    if (currentImage && product) {
      await api.deleteAdminProductImage(currentImage.id);
      await loadProduct();
    }

    setImageUrl("");
    setFileName("");
    setMessage("Mockup deleted.");
  };
  const removeColor = async () => {
    if (
      !product ||
      !color ||
      !window.confirm(`Remove the ${color} color and all its sizes?`)
    )
      return;
    try {
      await api.deleteAdminProductColor(product.id, color);
      setColor("");
      await loadProduct();
      setMessage("Color removed.");
    } catch (error) {
      setMessage(
        error instanceof Error ? error.message : "Could not remove this color.",
      );
    }
  };

  if (isNewProduct || !product)
    return (
      <main className="admin-page">
        <div className="admin-shell admin-editor-shell">
          <Link to="/admin" className="admin-back">
            ← All products
          </Link>
          <header className="admin-header">
            <div>
              <span className="admin-eyebrow">CREATE NEW PRODUCT</span>
              <h1>Set up your product</h1>
              <p>
                Define product details, upload mockups, and configure print areas.
              </p>
            </div>
            <button className="admin-save" onClick={createProduct}>
              Create product
            </button>
          </header>
          {message && <p className="admin-message">{message}</p>}
          <div className="admin-editor-grid">
            <section className="admin-panel admin-product-details-panel">
              <h2>Product information</h2>
              <label>
                Product name
                <input
                  value={productName}
                  onChange={(event) => handleNameChange(event.target.value)}
                  placeholder="Classic hoodie"
                />
              </label>
              <label>
                URL slug (auto-generated)
                <input
                  value={productSlug}
                  onChange={(event) => setProductSlug(event.target.value)}
                  placeholder="classic-hoodie"
                />
              </label>
              <label className="admin-description-field">
                Description
                <textarea
                  value={description}
                  onChange={(event) => setDescription(event.target.value)}
                  placeholder="Describe this product"
                  rows={5}
                />
              </label>
              <label>
                Price
                <input
                  type="number"
                  min="0"
                  value={productPrice}
                  onChange={(event) => setProductPrice(event.target.value)}
                  placeholder="2500"
                />
              </label>
              <label>
                Category
                <select
                  value={productCategoryId}
                  onChange={(event) => setProductCategoryId(event.target.value)}
                >
                  <option value="">Choose category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Type
                <select
                  value={productType}
                  onChange={(event) => setProductType(event.target.value)}
                >
                  <option value="">Choose type</option>
                  {productTypes.map((type) => (
                    <option key={type.id} value={type.name}>
                      {type.name}
                    </option>
                  ))}
                </select>
              </label>
              <label className="admin-checkbox-field">
                <input
                  type="checkbox"
                  checked={supportsDoublePrint}
                  onChange={(e) => setSupportsDoublePrint(e.target.checked)}
                />
                <span>Supports Double-Sided Printing (Front & Back)</span>
              </label>
              <label className="admin-description-field">
                Cover photo (catalog thumbnail)
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setCoverPhoto(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
                {coverPhoto && <img className="admin-size-chart-preview" src={coverPhoto} alt="Cover photo preview" />}
              </label>
              <label className="admin-description-field">
                Size dimensions image
                <input
                  type="file"
                  accept="image/*"
                  onChange={(event) => {
                    const file = event.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = () => setSizeChartImage(String(reader.result));
                    reader.readAsDataURL(file);
                  }}
                />
                {sizeChartImage && <img className="admin-size-chart-preview" src={sizeChartImage} alt="Size dimensions preview" />}
              </label>
            </section>
            <section className="admin-panel">
              <h2>1. First color & mockup</h2>
              <div className="admin-fields">
                <div className="base-color-list">
                  {baseColors.map(([name, hex]) => (
                    <button
                      type="button"
                      key={name}
                      style={{ backgroundColor: hex }}
                      title={name}
                      aria-label={name}
                      onClick={() => {
                        setNewColor(name);
                        setNewColorHex(hex);
                        setColor(name);
                        setSelectedBaseHex(hex);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className="admin-color-fields">
                  <input
                    placeholder="Color name"
                    value={newColor}
                    onChange={(event) => {
                      setNewColor(event.target.value);
                      setColor(event.target.value);
                      setSelectedBaseHex(null);
                    }}
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(event) => {
                      setNewColorHex(event.target.value);
                      if (
                        selectedBaseHex &&
                        selectedBaseHex.toLowerCase() !== event.target.value.toLowerCase()
                      ) {
                        setNewColor("");
                        setColor("");
                        setSelectedBaseHex(null);
                      }
                    }}
                  />
                </div>
                <h3>Sizes</h3>
                <div className="variant-checks">
                  {allSizes.map((size) => (
                    <label key={size}>
                      <input
                        type="checkbox"
                        checked={newColorSizes.includes(size)}
                        onChange={() =>
                          setNewColorSizes((previous) =>
                            previous.includes(size)
                              ? previous.filter((value) => value !== size)
                              : [...previous, size],
                          )
                        }
                      />
                      {size}
                    </label>
                  ))}
                </div>
                <div className="admin-segmented">
                  <span>Side</span>
                  <button
                    className={side === "FRONT" ? "selected" : ""}
                    onClick={() => setSide("FRONT")}
                  >
                    Front
                  </button>
                  <button
                    className={side === "BACK" ? "selected" : ""}
                    onClick={() => setSide("BACK")}
                  >
                    Back
                  </button>
                </div>
                <label className="admin-upload">
                  Upload mockup
                  <input type="file" accept="image/*" onChange={handleUpload} />
                </label>
                {fileName && <p className="admin-file">{fileName}</p>}
                {hasDraftImage && (
                  <button
                    type="button"
                    className="admin-danger"
                    onClick={deleteCurrentImage}
                  >
                    Delete this mockup
                  </button>
                )}
              </div>
            </section>
            <section className="admin-panel">
              <h2>2. Printable area</h2>
              <p className="admin-help">
                Drag the red box to move it. Drag the corner to resize it. Turn it
                off to remove printing for this side.
              </p>
              <div ref={stageRef} className="admin-stage">
                {imageUrl ? (
                  <img src={imageUrl} alt="Selected mockup" />
                ) : (
                  <div className="admin-stage-placeholder">
                    <p>Upload a mockup image to configure the print area</p>
                  </div>
                )}
                {currentArea.enabled && imageUrl && (
                  <div
                    className="admin-print-area"
                    style={{
                      left: `${currentArea.x * 100}%`,
                      top: `${currentArea.y * 100}%`,
                      width: `${currentArea.width * 100}%`,
                      height: `${currentArea.height * 100}%`,
                    }}
                    onPointerDown={(event) => startAreaDrag("move", event)}
                    onPointerMove={updateAreaFromPointer}
                    onPointerUp={stopAreaDrag}
                  >
                    <button
                      type="button"
                      onPointerDown={(event) => {
                        event.stopPropagation();
                        startAreaDrag("resize", event);
                      }}
                    >
                      ↘
                    </button>
                  </div>
                )}
              </div>
              <label className="admin-toggle">
                <input
                  type="checkbox"
                  checked={currentArea.enabled}
                  onChange={(event) =>
                    setAreas((previous) => ({
                      ...previous,
                      [side]: { ...currentArea, enabled: event.target.checked },
                    }))
                  }
                />{" "}
                Printing area enabled
              </label>
            </section>
          </div>
        </div>
      </main>
    );
  return (
    <main className="admin-page">
      <div className="admin-shell admin-editor-shell">
        <Link to="/admin" className="admin-back">
          ← All products
        </Link>
        <header className="admin-header">
          <div>
            <span className="admin-eyebrow">
              EDITING {productName.toUpperCase()}
            </span>
            <h1>Set up your product</h1>
            <p>
              Choose a color and side, upload its mockup, then shape the
              printable area.
            </p>
          </div>
          <button className="admin-save" onClick={save}>
            Save changes
          </button>
        </header>
        {message && <p className="admin-message">{message}</p>}
        <div className="admin-editor-grid">
          <section className="admin-panel admin-product-details-panel">
            <h2>Product information</h2>
            <label>
              Product name
              <input
                value={productName}
                onChange={(event) => handleNameChange(event.target.value)}
                placeholder="Classic hoodie"
              />
            </label>
            <label>
              URL slug (auto-generated)
              <input
                value={productSlug}
                onChange={(event) => setProductSlug(event.target.value)}
                placeholder="classic-hoodie"
              />
            </label>
            <label className="admin-description-field">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this product"
                rows={5}
              />
            </label>
            <label>
              Price
              <input
                type="number"
                min="0"
                value={productPrice}
                onChange={(event) => setProductPrice(event.target.value)}
                placeholder="2500"
              />
            </label>
            <label>
              Category
              <select
                value={productCategoryId}
                onChange={(event) => setProductCategoryId(event.target.value)}
              >
                <option value="">Choose category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </label>
            <label>
              Type
              <select
                value={productType}
                onChange={(event) => setProductType(event.target.value)}
              >
                <option value="">Choose type</option>
                {productTypes.map((type) => (
                  <option key={type.id} value={type.name}>
                    {type.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="admin-description-field">
              Cover photo (catalog thumbnail)
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setCoverPhoto(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
              {coverPhoto && <img className="admin-size-chart-preview" src={coverPhoto} alt="Cover photo preview" />}
            </label>
            <label className="admin-description-field">
              Size dimensions image
              <input
                type="file"
                accept="image/*"
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (!file) return;
                  const reader = new FileReader();
                  reader.onload = () => setSizeChartImage(String(reader.result));
                  reader.readAsDataURL(file);
                }}
              />
              {sizeChartImage && <img className="admin-size-chart-preview" src={sizeChartImage} alt="Size dimensions preview" />}
            </label>
          </section>
          <section className="admin-panel">
            <h2>1. Image and variants</h2>
            <div className="admin-fields">
              <div className="admin-color-row">
                <label>
                  Color
                  <select
                    value={color}
                    onChange={(event) => setColor(event.target.value)}
                  >
                    {colors.map((value) => (
                      <option key={value}>{value}</option>
                    ))}
                  </select>
                </label>
                <button
                  type="button"
                  className="admin-danger admin-remove-color"
                  onClick={removeColor}
                >
                  Remove color
                </button>
              </div>
              <div className="admin-new-color">
                <strong>Add a color variant</strong>
                <div className="base-color-list">
                  {baseColors.map(([name, hex]) => (
                    <button
                      type="button"
                      key={name}
                      style={{ backgroundColor: hex }}
                      title={name}
                      aria-label={name}
                      onClick={() => {
                        setNewColor(name);
                        setNewColorHex(hex);
                        setSelectedBaseHex(hex);
                      }}
                    >
                      {name}
                    </button>
                  ))}
                </div>
                <div className="admin-color-fields">
                  <input
                    placeholder="New color name"
                    value={newColor}
                    onChange={(event) => {
                      setNewColor(event.target.value);
                      setSelectedBaseHex(null);
                    }}
                  />
                  <input
                    type="color"
                    value={newColorHex}
                    onChange={(event) =>
                      handleNewColorHexChange(event.target.value)
                    }
                  />
                </div>
                <div className="variant-checks">
                  {allSizes.map((size) => (
                    <label key={size}>
                      <input
                        type="checkbox"
                        checked={newColorSizes.includes(size)}
                        onChange={() =>
                          setNewColorSizes((previous) =>
                            previous.includes(size)
                              ? previous.filter((value) => value !== size)
                              : [...previous, size],
                          )
                        }
                      />
                      {size}
                    </label>
                  ))}
                </div>
                <button
                  type="button"
                  className="admin-secondary"
                  onClick={addColorVariant}
                >
                  Add color
                </button>
              </div>

              {/* Colors Overview Section */}
              {colors.length > 0 && (
                <div className="admin-colors-overview">
                  <strong>Current Colors ({colors.length})</strong>
                  <div className="colors-grid">
                    {colors.map((colorName) => {
                      const frontImage = product?.productImages.find(
                        (img) => img.color === colorName && img.side === 'FRONT'
                      );
                      const backImage = product?.productImages.find(
                        (img) => img.color === colorName && img.side === 'BACK'
                      );
                      const colorVariants = product?.variants.filter((v) => v.color === colorName) || [];
                      const colorHex = colorVariants[0]?.colorHex || '#cccccc';
                      const isSelected = color === colorName;
                      const currentSizes = sortSizes(colorVariants.map((v) => v.size));
                      const editingSizes = editingColorSizes[colorName] || currentSizes;

                      return (
                        <div key={colorName} className={`color-card ${isSelected ? 'selected' : ''}`}>
                          <div
                            className="color-card-header"
                            onClick={() => {
                              setColor(colorName);
                              setMessage(`Now editing: ${colorName}`);
                              window.scrollTo({ top: 0, behavior: 'smooth' });
                            }}
                          >
                            <div className="color-swatch" style={{ backgroundColor: colorHex }}></div>
                            <span className="color-name">{colorName} {isSelected && '(editing)'}</span>
                            <button
                              type="button"
                              className="color-delete-btn"
                              onClick={async (e) => {
                                e.stopPropagation();
                                if (!window.confirm(`Remove "${colorName}" and all its variants?`)) return;
                                try {
                                  await api.deleteAdminProductColor(product!.id, colorName);
                                  await loadProduct();
                                  setMessage(`Color "${colorName}" removed successfully.`);
                                  if (color === colorName) {
                                    setColor(colors.find(c => c !== colorName) || '');
                                  }
                                } catch (error) {
                                  setMessage(error instanceof Error ? error.message : 'Could not remove color.');
                                }
                              }}
                              title={`Remove ${colorName}`}
                            >
                              ×
                            </button>
                          </div>
                          <div className="color-images">
                            <div className="color-image-item">
                              <span className="image-label">Front:</span>
                              {frontImage ? (
                                <div className="image-info">
                                  <img src={frontImage.url} alt={`${colorName} front`} className="color-thumbnail" />
                                  <span className="image-filename">{frontImage.fileName || 'No filename'}</span>
                                </div>
                              ) : (
                                <span className="image-missing">No front image</span>
                              )}
                            </div>
                            <div className="color-image-item">
                              <span className="image-label">Back:</span>
                              {backImage ? (
                                <div className="image-info">
                                  <img src={backImage.url} alt={`${colorName} back`} className="color-thumbnail" />
                                  <span className="image-filename">{backImage.fileName || 'No filename'}</span>
                                </div>
                              ) : (
                                <span className="image-missing">No back image</span>
                              )}
                            </div>
                          </div>
                          <div className="color-sizes-editor">
                            <strong>Sizes:</strong>
                            <div className="size-checkboxes">
                              {allSizes.map((size) => (
                                <label key={size}>
                                  <input
                                    type="checkbox"
                                    checked={editingSizes.includes(size)}
                                    onChange={(e) => {
                                      e.stopPropagation();
                                      const newSizes = e.target.checked
                                        ? sortSizes([...editingSizes, size])
                                        : editingSizes.filter(s => s !== size);
                                      setEditingColorSizes(prev => ({ ...prev, [colorName]: newSizes }));
                                    }}
                                  />
                                  {size}
                                </label>
                              ))}
                            </div>
                            {editingSizes.join(', ') !== currentSizes.join(', ') && (
                              <button
                                type="button"
                                className="admin-save-sizes"
                                onClick={async (e) => {
                                  e.stopPropagation();
                                  try {
                                    await api.updateAdminProductVariantSizes(product!.id, colorName, editingSizes);
                                    await loadProduct();
                                    setEditingColorSizes(prev => {
                                      const updated = { ...prev };
                                      delete updated[colorName];
                                      return updated;
                                    });
                                    setMessage(`Sizes updated for ${colorName}`);
                                  } catch (error) {
                                    setMessage(error instanceof Error ? error.message : 'Could not update sizes.');
                                  }
                                }}
                              >
                                Save Sizes
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              <div className="admin-segmented">
                <span>Side</span>
                <button
                  className={side === "FRONT" ? "selected" : ""}
                  onClick={() => setSide("FRONT")}
                >
                  Front
                </button>
                <button
                  className={side === "BACK" ? "selected" : ""}
                  onClick={() => setSide("BACK")}
                >
                  Back
                </button>
              </div>
              <label className="admin-upload">
                Upload mockup
                <input type="file" accept="image/*" onChange={handleUpload} />
              </label>
              {fileName && <p className="admin-file">{fileName}</p>}
              {(currentImage || hasDraftImage) && (
                <button
                  type="button"
                  className="admin-danger"
                  onClick={deleteCurrentImage}
                >
                  Delete this mockup
                </button>
              )}
            </div>
            <h3>Assign this image to sizes</h3>
            <div className="variant-checks">
              {variantsForColor.map((variant) => (
                <label key={variant.id}>
                  <input
                    type="checkbox"
                    checked={variantIds.includes(variant.id)}
                    onChange={() => toggleVariant(variant.id)}
                  />
                  {variant.size}
                </label>
              ))}
            </div>
          </section>
          <section className="admin-panel">
            <h2>2. Printable area</h2>
            <p className="admin-help">
              Drag the red box to move it. Drag the corner to resize it. Turn it
              off to remove printing for this side.
            </p>
            <div ref={stageRef} className="admin-stage">
              {imageUrl && <img src={imageUrl} alt="Selected mockup" />}
              {currentArea.enabled && (
                <div
                  className="admin-print-area"
                  style={{
                    left: `${currentArea.x * 100}%`,
                    top: `${currentArea.y * 100}%`,
                    width: `${currentArea.width * 100}%`,
                    height: `${currentArea.height * 100}%`,
                  }}
                  onPointerDown={(event) => startAreaDrag("move", event)}
                  onPointerMove={updateAreaFromPointer}
                  onPointerUp={stopAreaDrag}
                >
                  <button
                    type="button"
                    onPointerDown={(event) => {
                      event.stopPropagation();
                      startAreaDrag("resize", event);
                    }}
                  >
                    ↘
                  </button>
                </div>
              )}
            </div>
            <label className="admin-toggle">
              <input
                type="checkbox"
                checked={currentArea.enabled}
                onChange={(event) =>
                  setAreas((previous) => ({
                    ...previous,
                    [side]: { ...currentArea, enabled: event.target.checked },
                  }))
                }
              />{" "}
              Printing area enabled
            </label>
          </section>
        </div>
      </div>
    </main>
  );
}
