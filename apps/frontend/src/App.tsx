import { useCallback, useEffect, useState } from 'react'
import {
  addProduct,
  addToCart,
  checkActuatorHealth,
  checkApiHealth,
  checkDatabaseHealth,
  getCart,
  getProduct,
  getProducts,
  postSession,
  removeFromCart,
  setProductInactive,
  updateProduct,
  type CartDTO,
  type EndpointStatus,
  type ProductDTO,
  type ProductStatus,
} from './api'
import './App.css'

const ANALYTICS_STORAGE_KEY = 'asta.analyticsId'

type Route = 'shop' | 'admin'

type Notice = {
  kind: 'success' | 'error' | 'info'
  text: string
}

type ProductFormState = {
  publicId: string | null
  name: string
  description: string
  imagePath: string
  priceEuro: string
  amountInStock: string
  tag: string
  status: ProductStatus
}

const emptyProductForm: ProductFormState = {
  publicId: null,
  name: '',
  description: '',
  imagePath: '',
  priceEuro: '',
  amountInStock: '0',
  tag: '',
  status: 'ACTIVE',
}

let analyticsPosted = false

function App() {
  const [route, setRoute] = useState<Route>(getRoute())
  const [analyticsId] = useState(getOrCreateAnalyticsId)
  const [products, setProducts] = useState<ProductDTO[]>([])
  const [productsLoading, setProductsLoading] = useState(true)
  const [productsError, setProductsError] = useState('')
  const [selectedProduct, setSelectedProduct] = useState<ProductDTO | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [detailError, setDetailError] = useState('')
  const [cartItems, setCartItems] = useState<CartDTO[]>([])
  const [cartLoading, setCartLoading] = useState(true)
  const [cartError, setCartError] = useState('')

  useEffect(() => {
    const onPopState = () => setRoute(getRoute())
    window.addEventListener('popstate', onPopState)
    return () => window.removeEventListener('popstate', onPopState)
  }, [])

  useEffect(() => {
    if (!analyticsPosted) {
      analyticsPosted = true
      postSession({
        analyticsId,
        loginTimestamp: new Date().toISOString(),
      }).catch((error: unknown) => {
        console.warn('Analytics request failed', error)
      })
    }
  }, [analyticsId])

  const loadProducts = useCallback(async () => {
    setProductsLoading(true)
    setProductsError('')

    try {
      const nextProducts = await getProducts()
      setProducts(nextProducts)
      setSelectedProduct((currentProduct) => {
        if (
          currentProduct?.publicId &&
          !nextProducts.some((product) => product.publicId === currentProduct.publicId && isProductActive(product))
        ) {
          return null
        }

        return currentProduct
      })
    } catch (error) {
      setProductsError(readError(error, 'Produkte konnten nicht geladen werden.'))
    } finally {
      setProductsLoading(false)
    }
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadProducts()
    })
  }, [loadProducts])

  const loadCart = useCallback(async () => {
    setCartLoading(true)
    setCartError('')

    try {
      const nextCart = await getCart(analyticsId)
      setCartItems(nextCart)
    } catch (error) {
      setCartError(readError(error, 'Warenkorb konnte nicht geladen werden.'))
    } finally {
      setCartLoading(false)
    }
  }, [analyticsId])

  useEffect(() => {
    queueMicrotask(() => {
      void loadCart()
    })
  }, [loadCart])

  function navigate(nextRoute: Route) {
    const path = nextRoute === 'admin' ? '/admin/panel' : '/'
    window.history.pushState({}, '', path)
    setRoute(nextRoute)
  }

  async function selectProduct(publicId: string | null) {
    if (!publicId) {
      setDetailError('Dieses Produkt hat keine publicId.')
      return
    }

    setDetailLoading(true)
    setDetailError('')

    try {
      const product = await getProduct(publicId)
      setSelectedProduct(product)

      if (!product) {
        setDetailError('Produkt wurde von der API nicht gefunden.')
      }
    } catch (error) {
      setDetailError(readError(error, 'Produktdetails konnten nicht geladen werden.'))
    } finally {
      setDetailLoading(false)
    }
  }

  async function addProductToCart(product: ProductDTO) {
    if (!product.publicId) {
      setCartError('Dieses Produkt hat keine publicId.')
      return
    }

    setCartError('')

    try {
      await addToCart({
        analyticsId,
        publicProductId: product.publicId,
        amountSelected: 1,
        status: 1,
      })
      await loadCart()
    } catch (error) {
      setCartError(readError(error, 'Produkt konnte nicht in den Warenkorb gelegt werden.'))
    }
  }

  async function removeProductFromCart(publicProductId: string) {
    setCartError('')

    try {
      const nextCart = await removeFromCart(analyticsId, publicProductId)
      setCartItems(nextCart)
    } catch (error) {
      setCartError(readError(error, 'Produkt konnte nicht aus dem Warenkorb entfernt werden.'))
    }
  }

  const activeProducts = products.filter(isProductActive)
  const productCount = activeProducts.length

  return (
    <div className="app-shell">
      <header className="topbar">
        <a
          className="brand"
          href="/"
          onClick={(event) => {
            event.preventDefault()
            navigate('shop')
          }}
        >
          <span className="brand-mark">A</span>
          <span>
            <strong>AStA Shop</strong>
            <small>MVP Storefront</small>
          </span>
        </a>

        <nav className="topnav" aria-label="Hauptnavigation">
          <a
            aria-current={route === 'shop' ? 'page' : undefined}
            href="/"
            onClick={(event) => {
              event.preventDefault()
              navigate('shop')
            }}
          >
            Shop
          </a>
          <a
            aria-current={route === 'admin' ? 'page' : undefined}
            href="/admin/panel"
            onClick={(event) => {
              event.preventDefault()
              navigate('admin')
            }}
          >
            Admin
          </a>
        </nav>
      </header>

      <main>
        {route === 'admin' ? (
          <AdminPanel
            onRefreshProducts={loadProducts}
            products={products}
            productsError={productsError}
            productsLoading={productsLoading}
          />
        ) : (
          <ShopView
            analyticsId={analyticsId}
            detailError={detailError}
            detailLoading={detailLoading}
            cartError={cartError}
            cartItems={cartItems}
            cartLoading={cartLoading}
            onAddToCart={addProductToCart}
            onRefreshProducts={loadProducts}
            onRemoveFromCart={removeProductFromCart}
            onSelectProduct={selectProduct}
            productCount={productCount}
            products={activeProducts}
            productsError={productsError}
            productsLoading={productsLoading}
            selectedProduct={selectedProduct}
          />
        )}
      </main>
    </div>
  )
}

function ShopView({
  analyticsId,
  cartError,
  cartItems,
  cartLoading,
  detailError,
  detailLoading,
  onAddToCart,
  onRefreshProducts,
  onRemoveFromCart,
  onSelectProduct,
  productCount,
  products,
  productsError,
  productsLoading,
  selectedProduct,
}: {
  analyticsId: string
  cartError: string
  cartItems: CartDTO[]
  cartLoading: boolean
  detailError: string
  detailLoading: boolean
  onAddToCart: (product: ProductDTO) => Promise<void>
  onRefreshProducts: () => Promise<void>
  onRemoveFromCart: (publicProductId: string) => Promise<void>
  onSelectProduct: (publicId: string | null) => Promise<void>
  productCount: number
  products: ProductDTO[]
  productsError: string
  productsLoading: boolean
  selectedProduct: ProductDTO | null
}) {
  const cartProductIds = new Set(cartItems.map((item) => item.publicProductId))

  return (
    <div className="page-grid">
      <section className="shop-head">
        <div>
          <p className="eyebrow">Shop Ansicht</p>
          <h1>Produkte fuer den AStA-Webshop</h1>
          <p className="lede">
            Produktdaten kommen direkt aus der Spring API. Die Analytics-ID wird
            lokal gespeichert und als Session-Ersatz an das Backend gesendet.
          </p>
        </div>
        <div className="session-panel" aria-label="Analytics Session">
          <span>Analytics-ID</span>
          <code>{analyticsId || 'wird erstellt'}</code>
          <small>{productCount} Produkte geladen</small>
        </div>
      </section>

      <section className="section-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Sortiment</p>
            <h2>Produktliste</h2>
          </div>
          <button className="secondary-button" type="button" onClick={() => void onRefreshProducts()}>
            Aktualisieren
          </button>
        </div>

        {productsLoading ? <StateMessage title="Produkte werden geladen" /> : null}
        {productsError ? <StateMessage tone="error" title={productsError} /> : null}
        {!productsLoading && !productsError && products.length === 0 ? (
          <StateMessage title="Noch keine Produkte vorhanden" text="Lege im Admin-Panel ein erstes Produkt an." />
        ) : null}

        <div className="product-grid">
          {products.map((product) => (
            <ProductCard
              key={product.publicId ?? product.name}
              isInCart={product.publicId ? cartProductIds.has(product.publicId) : false}
              onAddToCart={() => void onAddToCart(product)}
              onSelect={() => void onSelectProduct(product.publicId)}
              product={product}
            />
          ))}
        </div>
      </section>

      <section className="section-band cart-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Warenkorb</p>
            <h2>Aktuelle Auswahl</h2>
          </div>
          <span className="cart-count">{cartItems.length} Artikel</span>
        </div>

        {cartLoading ? <StateMessage title="Warenkorb wird geladen" /> : null}
        {cartError ? <StateMessage tone="error" title={cartError} /> : null}
        {!cartLoading && !cartError && cartItems.length === 0 ? (
          <StateMessage title="Der Warenkorb ist leer." text="Fuege Produkte aus der Liste hinzu." />
        ) : null}
        {!cartLoading && cartItems.length > 0 ? (
          <CartList
            cartItems={cartItems}
            onRemoveFromCart={onRemoveFromCart}
            products={products}
          />
        ) : null}
      </section>

      <section className="section-band detail-band">
        <div className="section-title">
          <div>
            <p className="eyebrow">Details</p>
            <h2>Ausgewaehltes Produkt</h2>
          </div>
        </div>

        {detailLoading ? <StateMessage title="Produktdetails werden geladen" /> : null}
        {detailError ? <StateMessage tone="error" title={detailError} /> : null}
        {!detailLoading && !detailError && selectedProduct ? (
          <ProductDetail product={selectedProduct} />
        ) : null}
        {!detailLoading && !detailError && !selectedProduct ? (
          <StateMessage title="Waehle ein Produkt aus der Liste aus." />
        ) : null}
      </section>
    </div>
  )
}

function ProductCard({
  isInCart,
  onAddToCart,
  onSelect,
  product,
}: {
  isInCart: boolean
  onAddToCart: () => void
  onSelect: () => void
  product: ProductDTO
}) {
  return (
    <article className="product-card">
      <ProductImage imagePath={product.imagePath} name={product.name} />
      <div className="product-card-body">
        <div>
          <p className="tag">{product.tag || 'ohne Tag'}</p>
          <h3>{product.name || 'Unbenanntes Produkt'}</h3>
          <p>{product.description || 'Keine Beschreibung hinterlegt.'}</p>
        </div>
        <div className="product-meta">
          <strong>{formatPrice(product.price)}</strong>
          <span>{product.amountInStock} auf Lager</span>
        </div>
        <div className="card-actions">
          <button className="primary-button" disabled={isInCart} type="button" onClick={onAddToCart}>
            {isInCart ? 'Im Warenkorb' : 'In den Warenkorb'}
          </button>
          <button className="secondary-button" type="button" onClick={onSelect}>
            Details
          </button>
        </div>
      </div>
    </article>
  )
}

function CartList({
  cartItems,
  onRemoveFromCart,
  products,
}: {
  cartItems: CartDTO[]
  onRemoveFromCart: (publicProductId: string) => Promise<void>
  products: ProductDTO[]
}) {
  return (
    <div className="cart-list">
      {cartItems.map((item, index) => {
        const product = products.find((entry) => entry.publicId === item.publicProductId)
        const title = product?.name ?? item.publicProductId

        return (
          <article className="cart-row" key={`${item.publicProductId}-${item.status}-${index}`}>
            <div>
              <h3>{title}</h3>
              <p>
                {item.amountSelected}x
                {product ? ` · ${formatPrice(product.price * item.amountSelected)}` : ''}
              </p>
              <small>{item.publicProductId}</small>
            </div>
            <button
              className="danger-button"
              type="button"
              onClick={() => void onRemoveFromCart(item.publicProductId)}
            >
              Entfernen
            </button>
          </article>
        )
      })}
    </div>
  )
}

function ProductDetail({ product }: { product: ProductDTO }) {
  return (
    <div className="detail-layout">
      <ProductImage imagePath={product.imagePath} name={product.name} />
      <div>
        <p className="tag">{product.tag || 'ohne Tag'}</p>
        <h3>{product.name}</h3>
        <p>{product.description || 'Keine Beschreibung hinterlegt.'}</p>
        <dl className="details-list">
          <div>
            <dt>Public ID</dt>
            <dd>{product.publicId ?? 'nicht vorhanden'}</dd>
          </div>
          <div>
            <dt>Preis</dt>
            <dd>{formatPrice(product.price)}</dd>
          </div>
          <div>
            <dt>Bestand</dt>
            <dd>{product.amountInStock}</dd>
          </div>
          <div>
            <dt>Status</dt>
            <dd>{formatProductStatus(product.status)}</dd>
          </div>
        </dl>
      </div>
    </div>
  )
}

function AdminPanel({
  onRefreshProducts,
  products,
  productsError,
  productsLoading,
}: {
  onRefreshProducts: () => Promise<void>
  products: ProductDTO[]
  productsError: string
  productsLoading: boolean
}) {
  const [form, setForm] = useState<ProductFormState>(emptyProductForm)
  const [notice, setNotice] = useState<Notice | null>(null)
  const [saving, setSaving] = useState(false)
  const isEditing = Boolean(form.publicId)

  function editProduct(product: ProductDTO) {
    setForm(toProductForm(product))
    setNotice({ kind: 'info', text: 'Produkt ist im Formular geladen.' })
  }

  function resetForm() {
    setForm(emptyProductForm)
    setNotice(null)
  }

  async function submitProduct(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    const validationError = validateProductForm(form, isEditing)
    if (validationError) {
      setNotice({ kind: 'error', text: validationError })
      return
    }

    setSaving(true)
    setNotice(null)

    try {
      const payload = formToProduct(form)

      if (isEditing) {
        await updateProduct(payload)
        setNotice({ kind: 'success', text: 'Produkt wurde aktualisiert.' })
      } else {
        await addProduct({
          name: payload.name,
          description: payload.description,
          imagePath: payload.imagePath,
          price: payload.price,
          amountInStock: payload.amountInStock,
          tag: payload.tag,
          status: payload.status,
        })
        setNotice({ kind: 'success', text: 'Produkt wurde angelegt.' })
        setForm(emptyProductForm)
      }

      await onRefreshProducts()
    } catch (error) {
      setNotice({ kind: 'error', text: readError(error, 'Produkt konnte nicht gespeichert werden.') })
    } finally {
      setSaving(false)
    }
  }

  async function setInactiveProduct(product: ProductDTO) {
    if (!product.publicId) {
      setNotice({ kind: 'error', text: 'Produkt hat keine publicId und kann nicht inaktiv gesetzt werden.' })
      return
    }

    if (product.status === 'INACTIVE') {
      setNotice({ kind: 'info', text: 'Produkt ist bereits inaktiv.' })
      return
    }

    setSaving(true)
    setNotice(null)

    try {
      await setProductInactive(product.publicId)
      setNotice({ kind: 'success', text: 'Produkt wurde inaktiv gesetzt.' })

      if (form.publicId === product.publicId) {
        setForm(emptyProductForm)
      }

      await onRefreshProducts()
    } catch (error) {
      setNotice({ kind: 'error', text: readError(error, 'Produkt konnte nicht inaktiv gesetzt werden.') })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="page-grid admin-page">
      <section className="admin-head">
        <div>
          <p className="eyebrow">Admin Panel</p>
          <h1>Produkte und Systemstatus</h1>
          <p className="lede">
            Pflege das Sortiment und pruefe API sowie Datenbank ueber die Health-Endpunkte.
          </p>
        </div>
        <a className="secondary-link" href="/">
          Shop ansehen
        </a>
      </section>

      <AdminStatus />

      <section className="admin-layout">
        <form className="admin-form" onSubmit={(event) => void submitProduct(event)}>
          <div className="section-title compact">
            <div>
              <p className="eyebrow">{isEditing ? 'Bearbeiten' : 'Neu'}</p>
              <h2>{isEditing ? 'Produkt aktualisieren' : 'Produkt anlegen'}</h2>
            </div>
            {isEditing ? (
              <button className="ghost-button" type="button" onClick={resetForm}>
                Abbrechen
              </button>
            ) : null}
          </div>

          {notice ? <NoticeMessage notice={notice} /> : null}

          <label>
            Name
            <input
              onChange={(event) => setForm({ ...form, name: event.target.value })}
              placeholder="AStA Hoodie"
              type="text"
              value={form.name}
            />
          </label>

          <label>
            Beschreibung
            <textarea
              onChange={(event) => setForm({ ...form, description: event.target.value })}
              placeholder="Kurzbeschreibung fuer die Shopkarte"
              rows={4}
              value={form.description}
            />
          </label>

          <div className="form-grid">
            <label>
              Preis in EUR
              <input
                inputMode="decimal"
                onChange={(event) => setForm({ ...form, priceEuro: event.target.value })}
                placeholder="12.99"
                type="text"
                value={form.priceEuro}
              />
            </label>
            <label>
              Bestand
              <input
                inputMode="numeric"
                min="0"
                onChange={(event) => setForm({ ...form, amountInStock: event.target.value })}
                type="number"
                value={form.amountInStock}
              />
            </label>
          </div>

          <label>
            Bildpfad
            <input
              onChange={(event) => setForm({ ...form, imagePath: event.target.value })}
              placeholder="/images/products/hoodie.png"
              type="text"
              value={form.imagePath}
            />
          </label>

          <label>
            Tag
            <input
              onChange={(event) => setForm({ ...form, tag: event.target.value })}
              placeholder="clothing"
              type="text"
              value={form.tag}
            />
          </label>

          {isEditing ? (
            <p className="form-id">
              publicId: {form.publicId}
              <br />
              status: {formatProductStatus(form.status)}
            </p>
          ) : null}

          <button className="primary-button" disabled={saving} type="submit">
            {saving ? 'Speichern...' : isEditing ? 'Produkt speichern' : 'Produkt anlegen'}
          </button>
        </form>

        <section className="admin-products">
          <div className="section-title compact">
            <div>
              <p className="eyebrow">Sortiment</p>
              <h2>Produkte verwalten</h2>
            </div>
            <button className="secondary-button" type="button" onClick={() => void onRefreshProducts()}>
              Neu laden
            </button>
          </div>

          {productsLoading ? <StateMessage title="Produkte werden geladen" /> : null}
          {productsError ? <StateMessage tone="error" title={productsError} /> : null}
          {!productsLoading && !productsError && products.length === 0 ? (
            <StateMessage title="Noch keine Produkte vorhanden" />
          ) : null}

          <div className="admin-list">
            {products.map((product) => (
              <article className="admin-row" key={product.publicId ?? product.name}>
                <ProductImage imagePath={product.imagePath} name={product.name} />
                <div>
                  <p className="tag">{product.tag || 'ohne Tag'}</p>
                  <h3>{product.name || 'Unbenanntes Produkt'}</h3>
                  <p>{formatPrice(product.price)} · {product.amountInStock} auf Lager</p>
                  <span className={`product-status ${product.status?.toLowerCase() ?? 'unknown'}`}>
                    {formatProductStatus(product.status)}
                  </span>
                  <small>{product.publicId ?? 'keine publicId'}</small>
                </div>
                <div className="row-actions">
                  <button className="secondary-button" type="button" onClick={() => editProduct(product)}>
                    Bearbeiten
                  </button>
                  <button
                    className="danger-button"
                    disabled={saving || product.status === 'INACTIVE'}
                    type="button"
                    onClick={() => void setInactiveProduct(product)}
                  >
                    Inaktiv setzen
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </div>
  )
}

function AdminStatus() {
  const [statuses, setStatuses] = useState<EndpointStatus[]>([])
  const [loading, setLoading] = useState(true)

  const loadStatuses = useCallback(async () => {
    setLoading(true)
    const nextStatuses = await Promise.all([
      checkApiHealth(),
      checkActuatorHealth(),
      checkDatabaseHealth(),
    ])
    setStatuses(nextStatuses)
    setLoading(false)
  }, [])

  useEffect(() => {
    queueMicrotask(() => {
      void loadStatuses()
    })
  }, [loadStatuses])

  return (
    <section className="section-band status-section">
      <div className="section-title">
        <div>
          <p className="eyebrow">System</p>
          <h2>API und Datenbank</h2>
        </div>
        <button className="secondary-button" type="button" onClick={() => void loadStatuses()}>
          Status pruefen
        </button>
      </div>

      {loading ? <StateMessage title="Status wird geladen" /> : null}
      <div className="status-grid">
        {statuses.map((status) => (
          <article className="status-card" key={status.label}>
            <span className={`status-pill ${status.status.toLowerCase()}`}>{status.status}</span>
            <h3>{status.label}</h3>
            <p>{status.path}</p>
            <small>
              HTTP {status.httpStatus ?? 'n/a'} · {formatDateTime(status.checkedAt)}
            </small>
            {status.details ? <small>{status.details}</small> : null}
          </article>
        ))}
      </div>
    </section>
  )
}

function ProductImage({
  imagePath,
  name,
}: {
  imagePath: string
  name: string
}) {
  const [failedImagePath, setFailedImagePath] = useState<string | null>(null)
  const failed = failedImagePath === imagePath

  if (!imagePath || failed) {
    return <div className="image-placeholder">{name ? name.slice(0, 2).toUpperCase() : 'AS'}</div>
  }

  return <img alt={name} className="product-image" onError={() => setFailedImagePath(imagePath)} src={imagePath} />
}

function NoticeMessage({ notice }: { notice: Notice }) {
  return <p className={`notice ${notice.kind}`}>{notice.text}</p>
}

function StateMessage({
  text,
  title,
  tone = 'neutral',
}: {
  text?: string
  title: string
  tone?: 'neutral' | 'error'
}) {
  return (
    <div className={`state-message ${tone}`}>
      <strong>{title}</strong>
      {text ? <span>{text}</span> : null}
    </div>
  )
}

function getRoute(): Route {
  return window.location.pathname === '/admin/panel' ? 'admin' : 'shop'
}

function getOrCreateAnalyticsId() {
  const existing = localStorage.getItem(ANALYTICS_STORAGE_KEY)

  if (existing) {
    return existing
  }

  const nextId =
    typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(16).slice(2)}`

  localStorage.setItem(ANALYTICS_STORAGE_KEY, nextId)
  return nextId
}

function formatPrice(priceInCent: number) {
  return new Intl.NumberFormat('de-DE', {
    currency: 'EUR',
    style: 'currency',
  }).format(priceInCent / 100)
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('de-DE', {
    dateStyle: 'short',
    timeStyle: 'medium',
  }).format(new Date(value))
}

function readError(error: unknown, fallback: string) {
  return error instanceof Error ? error.message : fallback
}

function isProductActive(product: ProductDTO) {
  return product.status === null || product.status === 'ACTIVE'
}

function formatProductStatus(status: ProductStatus | null) {
  if (status === 'ACTIVE') {
    return 'Aktiv'
  }

  if (status === 'INACTIVE') {
    return 'Inaktiv'
  }

  return 'Unbekannt'
}

function toProductForm(product: ProductDTO): ProductFormState {
  return {
    publicId: product.publicId,
    name: product.name,
    description: product.description,
    imagePath: product.imagePath,
    priceEuro: (product.price / 100).toFixed(2),
    amountInStock: String(product.amountInStock),
    tag: product.tag,
    status: product.status ?? 'ACTIVE',
  }
}

function parseEuroToCent(value: string) {
  const normalized = value.trim().replace(',', '.')
  const euroValue = Number(normalized)

  if (!Number.isFinite(euroValue)) {
    return null
  }

  return Math.round(euroValue * 100)
}

function validateProductForm(form: ProductFormState, isEditing: boolean) {
  if (isEditing && !form.publicId) {
    return 'Zum Aktualisieren fehlt die publicId.'
  }

  if (!form.name.trim()) {
    return 'Name ist erforderlich.'
  }

  const price = parseEuroToCent(form.priceEuro)
  if (price === null || price < 0) {
    return 'Preis muss eine Zahl ab 0 sein.'
  }

  const amountInStock = Number(form.amountInStock)
  if (!Number.isInteger(amountInStock) || amountInStock < 0) {
    return 'Bestand muss eine ganze Zahl ab 0 sein.'
  }

  return ''
}

function formToProduct(form: ProductFormState): ProductDTO {
  return {
    publicId: form.publicId,
    name: form.name.trim(),
    description: form.description.trim(),
    imagePath: form.imagePath.trim(),
    price: parseEuroToCent(form.priceEuro) ?? 0,
    amountInStock: Number(form.amountInStock),
    tag: form.tag.trim(),
    status: form.status,
  }
}

export default App
