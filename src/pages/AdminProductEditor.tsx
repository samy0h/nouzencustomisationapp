import { useEffect, useMemo, useRef, useState } from "react";
import type { ChangeEvent, PointerEvent } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../services/api";
import { getProductImage } from "../utils/imageHelpers";
import type { AdminProductImage, ApiProduct, PrintAreaConfig } from "../types";
import "../styles/admin.css";

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
  const { id = "" } = useParams();
  const [product, setProduct] = useState<
    | (ApiProduct & {
        productImages: AdminProductImage[];
        printAreas: PrintAreaConfig[];
      })
    | null
  >(null);
  const [color, setColor] = useState("");
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

  const loadProduct = () =>
    api.getAdminProduct(id).then((response) => {
      const loaded = response.data.product;
      setProduct(loaded);
      setDescription(loaded.description || "");
      setSizeChartImage(loaded.sizeChartImage || "");
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
    loadProduct().catch(() => setMessage("Could not load this product."));
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
    () => [...new Set(product?.variants.map((variant) => variant.size) || [])],
    [product],
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
      name: product.name,
      slug: product.slug,
      description,
      sizeChartImage,
      price: product.price,
      type: product.type,
      categoryId: product.categoryId,
      supportsDoublePrint: product.supportsDoublePrint,
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
    if (!product) return;
    delete draftImagesRef.current[`${color}:${side}`];
    if (currentImage) await api.deleteAdminProductImage(currentImage.id);
    setImageUrl("");
    setFileName("");
    await loadProduct();
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

  if (!product)
    return (
      <main className="admin-page">
        <div className="admin-shell">
          <p>Loading product editor...</p>
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
              EDITING {product.name.toUpperCase()}
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
            <h2>Product details</h2>
            <label className="admin-description-field">
              Description
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Describe this product"
                rows={5}
              />
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
