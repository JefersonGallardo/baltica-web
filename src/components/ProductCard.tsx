"use client";

import Link from "next/link";
import { useState } from "react";
import { type Product, soles } from "@/lib/products";
import Tee from "./Tee";

export default function ProductCard({
  product,
  initialColor,
}: {
  product: Product;
  initialColor?: string;
}) {
  const [color, setColor] = useState(
    product.colors.find((c) => c.name === initialColor) ?? product.colors[0],
  );
  const href = `/producto/${product.slug}/?color=${encodeURIComponent(color.name)}`;

  return (
    <article className="card">
      <Link href={href} className="card-media" aria-label={`${product.name}, ${color.name}`}>
        <Tee color={color} shape={product.shape} className="card-tee" />
        {product.isNew && <span className="badge">Nuevo</span>}
      </Link>
      <div className="card-body">
        <h3>
          <Link href={href}>{product.name}</Link>
        </h3>
        <p className="card-short">{product.short}</p>
        <div className="swatches" role="radiogroup" aria-label="Color">
          {product.colors.map((c) => (
            <button
              key={c.name}
              role="radio"
              aria-checked={c.name === color.name}
              aria-label={c.name}
              title={c.name}
              className="swatch"
              style={{ background: c.hex }}
              onClick={() => setColor(c)}
            />
          ))}
        </div>
        <div className="card-price">
          <strong>{soles(product.price)}</strong>
          <span>{soles(product.wholesale)} por mayor</span>
        </div>
      </div>
    </article>
  );
}
