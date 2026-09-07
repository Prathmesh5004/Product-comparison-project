/*
|--------------------------------------------------------------------------
| INTERNAL API
|--------------------------------------------------------------------------
|
| Replace this with your actual internal API URL.
|
*/

const API_URL = null;

const MOCK_PRODUCTS = [
  {
    id: 1,
    name: "iPhone 16",
    brand: "Apple",
    price: 69999,
    currency: "INR",
    rating: 4.7,
    reviewCount: 2100,
    inStock: true,
    category: "Smartphone",
    image: "https://images.unsplash.com/photo-1592286927505-2fd6d1d4a1e5?w=200",
    specifications: {
      RAM: "8 GB",
      Storage: "128 GB",
      Display: "6.1 inch"
    }
  },
  {
    id: 2,
    name: "Galaxy S25",
    brand: "Samsung",
    price: 74999,
    currency: "INR",
    rating: 4.6,
    reviewCount: 1250,
    inStock: true,
    category: "Smartphone",
    image: "https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=200",
    specifications: {
      RAM: "12 GB",
      Storage: "256 GB",
      Display: "6.2 inch"
    }
  },
  {
    id: 3,
    name: "Pixel 9",
    brand: "Google",
    price: 64999,
    currency: "INR",
    rating: 4.5,
    reviewCount: 980,
    inStock: false,
    category: "Smartphone",
    image: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?w=200",
    specifications: {
      RAM: "12 GB",
      Storage: "128 GB",
      Display: "6.3 inch"
    }
  }
];



/*
|--------------------------------------------------------------------------
| APPLICATION STATE
|--------------------------------------------------------------------------
*/

async function loadProducts() {

  setStatus("Loading...", "loading");

  content.innerHTML = `
    <div class="loading">
      <div class="loader"></div>
      Loading products...
    </div>
  `;

  try {

    let data;

    if (API_URL) {

      const response = await fetch(API_URL, {
        method: "GET",
        headers: {
          "Accept": "application/json"
        }
      });

      if (!response.ok) {
        throw new Error(
          `API returned HTTP ${response.status}`
        );
      }

      data = await response.json();

    } else {

      // Local test data
      await new Promise(
        resolve => setTimeout(resolve, 500)
      );

      data = MOCK_PRODUCTS;

    }

    products =
      Array.isArray(data)
        ? data
        : data.products ||
          data.data ||
          [];

    setStatus(
      API_URL
        ? "API Connected"
        : "Demo Data",
      "online"
    );

    updateDashboard();

  } catch (error) {

    console.error(error);

    setStatus(
      "API Error",
      "error"
    );

    content.innerHTML = `
      <div class="error">
        <strong>Unable to load products</strong>
        <br><br>
        ${escapeHTML(error.message)}
      </div>
    `;

    updateStats([]);

  }
}



/*
|--------------------------------------------------------------------------
| DOM ELEMENTS
|--------------------------------------------------------------------------
*/

const content =
  document.getElementById("content");

const searchInput =
  document.getElementById("searchInput");

const sortSelect =
  document.getElementById("sortSelect");

const refreshBtn =
  document.getElementById("refreshBtn");

const productCount =
  document.getElementById("productCount");

const apiStatus =
  document.getElementById("apiStatus");

const statusDot =
  document.getElementById("statusDot");


/*
|--------------------------------------------------------------------------
| LOAD PRODUCTS
|--------------------------------------------------------------------------
*/

async function loadProducts() {

  setStatus("Connecting...", "loading");

  content.innerHTML = `
    <div class="loading">
      <div class="loader"></div>
      Loading products...
    </div>
  `;

  try {

    const response = await fetch(API_URL, {

      method: "GET",

      headers: {
        "Accept": "application/json"

        /*
         * If your API needs authentication:
         *
         * "Authorization":
         *   "Bearer YOUR_TOKEN"
         */
      }

    });


    if (!response.ok) {

      throw new Error(
        `API returned HTTP ${response.status}`
      );

    }


    const data =
      await response.json();


    /*
     * Supports both:
     *
     * [
     *   {...}
     * ]
     *
     * and:
     *
     * {
     *   products: [...]
     * }
     */

    products =
      Array.isArray(data)
        ? data
        : data.products ||
          data.data ||
          [];


    setStatus(
      "API Connected",
      "online"
    );


    updateDashboard();

  } catch (error) {

    console.error(
      "API Error:",
      error
    );


    setStatus(
      "API Error",
      "error"
    );


    content.innerHTML = `
      <div class="error">

        <strong>
          Unable to load products
        </strong>

        <br><br>

        ${escapeHTML(error.message)}

        <br><br>

        Check your API URL,
        CORS configuration and
        server status.

      </div>
    `;


    updateStats([]);

  }

}


/*
|--------------------------------------------------------------------------
| UPDATE DASHBOARD
|--------------------------------------------------------------------------
*/

function updateDashboard() {

  const filteredProducts =
    getFilteredProducts();


  updateStats(products);

  renderProducts(
    filteredProducts
  );


  productCount.textContent =
    `${filteredProducts.length} product${
      filteredProducts.length === 1
        ? ""
        : "s"
    }`;

}


/*
|--------------------------------------------------------------------------
| FILTER + SORT
|--------------------------------------------------------------------------
*/

function getFilteredProducts() {

  const search =
    searchInput.value
      .toLowerCase()
      .trim();


  const sort =
    sortSelect.value;


  let result =
    products.filter(product => {

      const name =
        String(
          product.name ||
          product.title ||
          product.productName ||
          ""
        ).toLowerCase();


      const brand =
        String(
          product.brand ||
          ""
        ).toLowerCase();


      return (
        name.includes(search) ||
        brand.includes(search)
      );

    });


  switch (sort) {

    case "price-low":

      result.sort(
        (a, b) =>
          getPrice(a) -
          getPrice(b)
      );

      break;


    case "price-high":

      result.sort(
        (a, b) =>
          getPrice(b) -
          getPrice(a)
      );

      break;


    case "rating-high":

      result.sort(
        (a, b) =>
          getRating(b) -
          getRating(a)
      );

      break;


    case "name":

      result.sort(
        (a, b) =>
          getName(a).localeCompare(
            getName(b)
          )
      );

      break;

  }


  return result;

}


/*
|--------------------------------------------------------------------------
| RENDER TABLE
|--------------------------------------------------------------------------
*/

function renderProducts(items) {

  if (!items.length) {

    content.innerHTML = `
      <div class="empty">
        No products found.
      </div>
    `;

    return;

  }


  const prices =
    items
      .map(getPrice)
      .filter(
        price => price > 0
      );


  const lowestPrice =
    prices.length
      ? Math.min(...prices)
      : 0;


  let html = `

    <table>

      <thead>

        <tr>

          <th>Product</th>

          <th>Price</th>

          <th>Rating</th>

          <th>Availability</th>

          <th>Category</th>

          <th>Specifications</th>

        </tr>

      </thead>

      <tbody>

  `;


  items.forEach(product => {

    const price =
      getPrice(product);


    const isBestValue =
      price > 0 &&
      price === lowestPrice;


    html += `

      <tr
        class="${
          isBestValue
            ? "best-value"
            : ""
        }"
      >

        <td>

          <div class="product-cell">

            <img
              class="product-image"
              src="${escapeAttribute(
                product.image ||
                product.imageUrl ||
                "https://via.placeholder.com/100"
              )}"
              alt="${escapeAttribute(
                getName(product)
              )}"
              onerror="
                this.src='https://via.placeholder.com/100'
              "
            >

            <div>

              <div class="product-name">
                ${escapeHTML(
                  getName(product)
                )}
              </div>

              <div class="product-brand">
                ${escapeHTML(
                  product.brand ||
                  "Unknown brand"
                )}
              </div>

              ${
                isBestValue
                  ? `
                    <span class="badge green">
                      Best Value
                    </span>
                  `
                  : ""
              }

            </div>

          </div>

        </td>


        <td>

          <span class="price">
            ${formatPrice(
              price,
              product
            )}
          </span>

        </td>


        <td>

          <span class="rating">
            ★ ${getRating(product).toFixed(1)}
          </span>

          ${
            product.reviewCount
              ? `
                <span class="rating-count">
                  (${escapeHTML(
                    product.reviewCount
                  )})
                </span>
              `
              : ""
          }

        </td>


        <td>

          ${
            getAvailability(product)

              ? `
                <span class="badge green">
                  In Stock
                </span>
              `

              : `
                <span class="badge red">
                  Out of Stock
                </span>
              `
          }

        </td>


        <td>

          <span class="badge blue">

            ${escapeHTML(
              product.category ||
              "General"
            )}

          </span>

        </td>


        <td>

          ${renderSpecifications(
            product
          )}

        </td>

      </tr>

    `;

  });


  html += `

      </tbody>

    </table>

  `;


  content.innerHTML = html;

}


/*
|--------------------------------------------------------------------------
| DASHBOARD STATISTICS
|--------------------------------------------------------------------------
*/

function updateStats(items) {

  document.getElementById(
    "totalProducts"
  ).textContent = items.length;


  if (!items.length) {

    document.getElementById(
      "lowestPrice"
    ).textContent = "—";


    document.getElementById(
      "highestRating"
    ).textContent = "—";


    document.getElementById(
      "averagePrice"
    ).textContent = "—";


    return;

  }


  const prices =
    items
      .map(getPrice)
      .filter(
        price => price > 0
      );


  const ratings =
    items
      .map(getRating)
      .filter(
        rating => rating > 0
      );


  const lowest =
    prices.length
      ? Math.min(...prices)
      : 0;


  const highestRating =
    ratings.length
      ? Math.max(...ratings)
      : 0;


  const average =
    prices.length
      ? prices.reduce(
          (sum, price) =>
            sum + price,
          0
        ) / prices.length
      : 0;


  document.getElementById(
    "lowestPrice"
  ).textContent =
    formatNumber(lowest);


  document.getElementById(
    "highestRating"
  ).textContent =
    highestRating
      ? `★ ${highestRating.toFixed(1)}`
      : "—";


  document.getElementById(
    "averagePrice"
  ).textContent =
    formatNumber(average);

}


/*
|--------------------------------------------------------------------------
| API FIELD MAPPERS
|--------------------------------------------------------------------------
*/

function getName(product) {

  return (
    product.name ||
    product.title ||
    product.productName ||
    "Unnamed Product"
  );

}


function getPrice(product) {

  return Number(
    product.price ??
    product.salePrice ??
    product.currentPrice ??
    0
  ) || 0;

}


function getRating(product) {

  return Number(
    product.rating ??
    product.averageRating ??
    0
  ) || 0;

}


function getAvailability(product) {

  if (
    product.inStock !==
    undefined
  ) {

    return Boolean(
      product.inStock
    );

  }


  if (
    product.available !==
    undefined
  ) {

    return Boolean(
      product.available
    );

  }


  const status =
    String(
      product.availability ||
      ""
    ).toLowerCase();


  return ![
    "out of stock",
    "unavailable",
    "sold out"
  ].includes(status);

}


/*
|--------------------------------------------------------------------------
| SPECIFICATIONS
|--------------------------------------------------------------------------
*/

function renderSpecifications(
  product
) {

  const specs =
    product.specifications ||
    product.specs;


  if (!specs) {
    return "—";
  }


  if (
    typeof specs ===
    "string"
  ) {

    return escapeHTML(
      specs
    );

  }


  if (
    typeof specs ===
    "object"
  ) {

    return Object.entries(
      specs
    )

      .slice(0, 3)

      .map(
        ([key, value]) => `
          <div>
            <strong>
              ${escapeHTML(key)}:
            </strong>

            ${escapeHTML(
              String(value)
            )}
          </div>
        `
      )

      .join("");

  }


  return "—";

}


/*
|--------------------------------------------------------------------------
| FORMATTERS
|--------------------------------------------------------------------------
*/

function formatNumber(value) {

  return new Intl.NumberFormat(
    "en-IN",
    {
      style: "currency",
      currency: "INR",
      maximumFractionDigits: 0
    }
  ).format(value);

}


function formatPrice(
  price,
  product
) {

  const currency =
    product.currency ||
    "INR";


  try {

    return new Intl.NumberFormat(
      "en-IN",
      {
        style: "currency",
        currency,
        maximumFractionDigits: 0
      }
    ).format(price);

  } catch {

    return `${currency} ${price}`;

  }

}


/*
|--------------------------------------------------------------------------
| API STATUS
|--------------------------------------------------------------------------
*/

function setStatus(
  text,
  state
) {

  apiStatus.textContent =
    text;


  statusDot.className =
    "status-dot";


  if (
    state === "online"
  ) {

    statusDot.classList.add(
      "online"
    );

  }


  if (
    state === "error"
  ) {

    statusDot.classList.add(
      "error"
    );

  }

}


/*
|--------------------------------------------------------------------------
| SECURITY HELPERS
|--------------------------------------------------------------------------
*/

function escapeHTML(value) {

  return String(value)

    .replace(
      /&/g,
      "&amp;"
    )

    .replace(
      /</g,
      "&lt;"
    )

    .replace(
      />/g,
      "&gt;"
    )

    .replace(
      /"/g,
      "&quot;"
    )

    .replace(
      /'/g,
      "&#039;"
    );

}


function escapeAttribute(value) {

  return escapeHTML(value);

}


/*
|--------------------------------------------------------------------------
| EVENTS
|--------------------------------------------------------------------------
*/

searchInput.addEventListener(
  "input",
  updateDashboard
);


sortSelect.addEventListener(
  "change",
  updateDashboard
);


refreshBtn.addEventListener(
  "click",
  loadProducts
);


/*
|--------------------------------------------------------------------------
| INITIAL LOAD
|--------------------------------------------------------------------------
*/

loadProducts();