const API_URL = "https://dummyjson.com/products?limit=200";

/*
 * Fixed conversion rate.
 * Change this value whenever you want to update the USD → INR rate.
 */
const USD_TO_INR = 83.50;

let allProducts = [];
let filteredProducts = [];
let selectedProducts = [];


// =============================================
// DOM ELEMENTS
// =============================================

const productGrid =
    document.getElementById("productGrid");

const loading =
    document.getElementById("loading");

const errorMessage =
    document.getElementById("errorMessage");

const emptyState =
    document.getElementById("emptyState");

const searchInput =
    document.getElementById("searchInput");

const categoryFilter =
    document.getElementById("categoryFilter");

const sortFilter =
    document.getElementById("sortFilter");

const productCount =
    document.getElementById("productCount");

const heroProductCount =
    document.getElementById("heroProductCount");

const resultsText =
    document.getElementById("resultsText");

const floatingCompareBtn =
    document.getElementById("floatingCompareBtn");

const compareCount =
    document.getElementById("compareCount");

const comparisonModal =
    document.getElementById("comparisonModal");

const comparisonContent =
    document.getElementById("comparisonContent");

const closeModal =
    document.getElementById("closeModal");

const retryBtn =
    document.getElementById("retryBtn");

const similarPopup =
    document.getElementById("similarPopup");

const similarProducts =
    document.getElementById("similarProducts");

const closePopup =
    document.getElementById("closePopup");


// =============================================
// ELECTRONIC CATEGORIES
// =============================================

/*
 * DummyJSON contains many different categories.
 * Only these categories are treated as electronics.
 */

const ELECTRONIC_CATEGORIES = [
    "smartphones",
    "laptops",
    "tablets",
    "mobile-accessories"
];


// =============================================
// FETCH PRODUCTS
// =============================================

async function fetchProducts() {

    showLoading();

    try {

        const response =
            await fetch(API_URL);

        if (!response.ok) {
            throw new Error(
                "API request failed"
            );
        }

        const data =
            await response.json();


        /*
         * Keep only electronic products.
         */

        allProducts =
            data.products.filter(product =>
                ELECTRONIC_CATEGORIES.includes(
                    product.category
                )
            );


        /*
         * Start with all electronic products.
         */

        filteredProducts =
            [...allProducts];


        populateCategories();

        updateCounters();

        renderProducts();


    } catch (error) {

        console.error(
            "Product loading error:",
            error
        );

        loading.classList.add(
            "hidden"
        );

        errorMessage.classList.remove(
            "hidden"
        );

    }

}


// =============================================
// LOADING STATE
// =============================================

function showLoading() {

    loading.classList.remove(
        "hidden"
    );

    errorMessage.classList.add(
        "hidden"
    );

    emptyState.classList.add(
        "hidden"
    );

    productGrid.innerHTML = "";

}


// =============================================
// CATEGORY DROPDOWN
// =============================================

function populateCategories() {

    const categories = [
        ...new Set(
            allProducts.map(
                product => product.category
            )
        )
    ];


    categories.sort();


    categoryFilter.innerHTML = `
        <option value="all">
            All Categories
        </option>
    `;


    categories.forEach(
        category => {

            const option =
                document.createElement(
                    "option"
                );

            option.value =
                category;

            option.textContent =
                formatCategory(
                    category
                );

            categoryFilter.appendChild(
                option
            );

        }
    );

}


// =============================================
// FORMAT CATEGORY
// =============================================

function formatCategory(category) {

    return category
        .replaceAll("-", " ")
        .replace(
            /\b\w/g,
            letter =>
                letter.toUpperCase()
        );

}


// =============================================
// USD → INR
// =============================================

function priceInINR(price) {

    return price * USD_TO_INR;

}


function formatINR(price) {

    return new Intl.NumberFormat(
        "en-IN",
        {
            style: "currency",
            currency: "INR",
            maximumFractionDigits: 0
        }
    ).format(
        priceInINR(price)
    );

}


// =============================================
// FILTER PRODUCTS
// =============================================

function filterProducts() {

    const searchTerm =
        searchInput.value
            .toLowerCase()
            .trim();


    const selectedCategory =
        categoryFilter.value;


    filteredProducts =
        allProducts.filter(
            product => {

                const title =
                    product.title
                        .toLowerCase();

                const description =
                    product.description
                        .toLowerCase();

                const category =
                    product.category
                        .toLowerCase();


                const matchesSearch =
                    title.includes(
                        searchTerm
                    ) ||

                    description.includes(
                        searchTerm
                    ) ||

                    category.includes(
                        searchTerm
                    );


                const matchesCategory =
                    selectedCategory === "all" ||

                    product.category ===
                        selectedCategory;


                return (
                    matchesSearch &&
                    matchesCategory
                );

            }
        );


    sortProducts();


    /*
     * Show similar products
     * whenever the user searches.
     */

    if (searchTerm.length > 0) {

        showSimilarProducts(
            searchTerm
        );

    } else {

        hideSimilarPopup();

    }

}


// =============================================
// SORT PRODUCTS
// =============================================

function sortProducts() {

    const sortValue =
        sortFilter.value;


    switch (sortValue) {

        case "price-low":

            filteredProducts.sort(
                (a, b) =>
                    a.price - b.price
            );

            break;


        case "price-high":

            filteredProducts.sort(
                (a, b) =>
                    b.price - a.price
            );

            break;


        case "rating-high":

            filteredProducts.sort(
                (a, b) =>
                    b.rating - a.rating
            );

            break;


        case "rating-low":

            filteredProducts.sort(
                (a, b) =>
                    a.rating - b.rating
            );

            break;


        default:

            break;

    }


    renderProducts();

}


// =============================================
// RENDER PRODUCTS
// =============================================

function renderProducts() {

    loading.classList.add(
        "hidden"
    );

    productGrid.innerHTML = "";


    resultsText.textContent =
        `${filteredProducts.length} result${
            filteredProducts.length !== 1
                ? "s"
                : ""
        }`;


    if (
        filteredProducts.length === 0
    ) {

        emptyState.classList.remove(
            "hidden"
        );

        return;

    }


    emptyState.classList.add(
        "hidden"
    );


    filteredProducts.forEach(
        product => {

            const card =
                createProductCard(
                    product
                );

            productGrid.appendChild(
                card
            );

        }
    );

}


// =============================================
// CREATE PRODUCT CARD
// =============================================

function createProductCard(product) {

    const card =
        document.createElement(
            "article"
        );


    const isSelected =
        selectedProducts.some(
            selected =>
                selected.id ===
                product.id
        );


    const discount =
        Math.round(
            product.discountPercentage
        );


    const stockClass =
        product.stock < 20
            ? "low"
            : "";


    card.className =
        `product-card ${
            isSelected
                ? "selected"
                : ""
        }`;


    card.innerHTML = `

        <div class="product-image">

            <img
                src="${product.thumbnail}"
                alt="${escapeHTML(
                    product.title
                )}"
                loading="lazy"
            >

            <span class="discount">
                -${discount}%
            </span>

            <button
                class="compare-check ${
                    isSelected
                        ? "active"
                        : ""
                }"
                data-id="${product.id}"
                title="Add to comparison"
            >
                ${
                    isSelected
                        ? "✓"
                        : "+"
                }
            </button>

        </div>


        <div class="product-info">

            <span class="category">
                ${formatCategory(
                    product.category
                )}
            </span>


            <h3 class="product-name">
                ${escapeHTML(
                    product.title
                )}
            </h3>


            <p class="description">
                ${escapeHTML(
                    product.description
                )}
            </p>


            <div class="rating-row">

                <span class="stars">
                    ${getStars(
                        product.rating
                    )}
                </span>

                <strong>
                    ${product.rating.toFixed(1)}
                </strong>

                <span class="rating-count">
                    / 5
                </span>

            </div>


            <div class="price-row">

                <strong class="price">
                    ${formatINR(
                        product.price
                    )}
                </strong>


                <span
                    class="stock ${stockClass}"
                >
                    ${product.stock}
                    in stock
                </span>

            </div>

        </div>

    `;


    const compareButton =
        card.querySelector(
            ".compare-check"
        );


    compareButton.addEventListener(
        "click",
        event => {

            event.stopPropagation();

            toggleCompare(
                product
            );

        }
    );


    return card;

}


// =============================================
// STAR RATING
// =============================================

function getStars(rating) {

    const rounded =
        Math.round(rating);


    return (
        "★".repeat(rounded) +
        "☆".repeat(
            5 - rounded
        )
    );

}


// =============================================
// SELECT / DESELECT PRODUCT
// =============================================

function toggleCompare(product) {

    const existingIndex =
        selectedProducts.findIndex(
            selected =>
                selected.id ===
                product.id
        );


    /*
     * Remove product if
     * already selected.
     */

    if (existingIndex !== -1) {

        selectedProducts.splice(
            existingIndex,
            1
        );

    }

    /*
     * Add product.
     */

    else {

        /*
         * ONLY TWO PRODUCTS.
         */

        if (
            selectedProducts.length >= 2
        ) {

            alert(
                "Only 2 products can be compared at a time."
            );

            return;

        }


        selectedProducts.push(
            product
        );

    }


    updateCompareCount();

    renderProducts();

}


// =============================================
// COMPARE COUNTER
// =============================================

function updateCompareCount() {

    compareCount.textContent =
        `${selectedProducts.length} / 2`;

}


// =============================================
// PRODUCT COUNTERS
// =============================================

function updateCounters() {

    const count =
        allProducts.length;


    productCount.textContent =
        `${count} Products`;


    heroProductCount.textContent =
        count;

}


// =============================================
// SIMILAR PRODUCTS
// =============================================

function showSimilarProducts(
    searchTerm
) {

    const terms =
        searchTerm
            .split(/\s+/)
            .filter(Boolean);


    /*
     * Give each product a search score.
     */

    const matches =
        allProducts
            .map(product => {

                const title =
                    product.title
                        .toLowerCase();

                const description =
                    product.description
                        .toLowerCase();

                const category =
                    product.category
                        .toLowerCase();


                const searchable =
                    `${title} ${description} ${category}`;


                let score = 0;


                terms.forEach(
                    term => {

                        if (
                            searchable.includes(
                                term
                            )
                        ) {
                            score++;
                        }

                    }
                );


                /*
                 * Exact title match gets
                 * a stronger score.
                 */

                if (
                    title.includes(
                        searchTerm
                    )
                ) {

                    score += 3;

                }


                /*
                 * Category match gets
                 * additional priority.
                 */

                if (
                    category.includes(
                        searchTerm
                    )
                ) {

                    score += 2;

                }


                return {
                    product,
                    score
                };

            })


            .filter(
                item =>
                    item.score > 0
            )


            .sort(
                (a, b) =>
                    b.score - a.score
            )


            /*
             * Show maximum 5 similar items.
             */

            .slice(0, 5);


    similarProducts.innerHTML = "";


    if (
        matches.length === 0
    ) {

        similarProducts.innerHTML = `

            <div class="similar-empty">

                No similar electronics found.

            </div>

        `;

    }


    else {

        matches.forEach(
            ({ product }) => {

                const item =
                    document.createElement(
                        "div"
                    );


                item.className =
                    "similar-item";


                item.innerHTML = `

                    <img
                        src="${product.thumbnail}"
                        alt="${escapeHTML(
                            product.title
                        )}"
                    >


                    <div class="similar-info">

                        <div class="similar-name">

                            ${escapeHTML(
                                product.title
                            )}

                        </div>


                        <div class="similar-price">

                            ${formatINR(
                                product.price
                            )}

                        </div>

                    </div>

                `;


                /*
                 * Clicking a similar product
                 * searches for that product.
                 */

                item.addEventListener(
                    "click",
                    () => {

                        searchInput.value =
                            product.title;


                        filterProducts();


                        hideSimilarPopup();


                        /*
                         * Scroll to product grid.
                         */

                        window.scrollTo({

                            top:
                                productGrid
                                    .offsetTop -
                                100,

                            behavior:
                                "smooth"

                        });

                    }
                );


                similarProducts.appendChild(
                    item
                );

            }
        );

    }


    similarPopup.classList.remove(
        "hidden"
    );

}


// =============================================
// HIDE SIMILAR POPUP
// =============================================

function hideSimilarPopup() {

    similarPopup.classList.add(
        "hidden"
    );

}


// =============================================
// OPEN COMPARISON
// =============================================

function openComparison() {

    /*
     * Comparison requires EXACTLY 2.
     */

    if (
        selectedProducts.length !== 2
    ) {

        alert(
            "Please select exactly 2 products to compare."
        );

        return;

    }


    renderComparison();


    comparisonModal.classList.remove(
        "hidden"
    );


    document.body.style.overflow =
        "hidden";

}


// =============================================
// RENDER COMPARISON
// =============================================

function renderComparison() {

    const products =
        selectedProducts;


    const lowestPrice =
        Math.min(
            ...products.map(
                product =>
                    product.price
            )
        );


    const highestRating =
        Math.max(
            ...products.map(
                product =>
                    product.rating
            )
        );


    comparisonContent.innerHTML = `

        <div style="overflow-x:auto">

            <table
                class="comparison-table"
            >

                <!-- PRODUCT -->

                <tr>

                    <th>
                        Product
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            <img
                                class="compare-product-image"
                                src="${product.thumbnail}"
                                alt="${escapeHTML(
                                    product.title
                                )}"
                            >


                            <div
                                class="compare-product-name"
                            >
                                ${escapeHTML(
                                    product.title
                                )}
                            </div>

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- PRICE -->

                <tr>

                    <th>
                        Price
                    </th>


                    ${products.map(
                        product => {

                            const isBest =
                                product.price ===
                                lowestPrice;


                            return `

                                <td class="${
                                    isBest
                                        ? "best"
                                        : ""
                                }">

                                    ${formatINR(
                                        product.price
                                    )}

                                    ${
                                        isBest
                                            ? " ✓ Best Price"
                                            : ""
                                    }

                                </td>

                            `;

                        }
                    ).join("")}

                </tr>


                <!-- RATING -->

                <tr>

                    <th>
                        Rating
                    </th>


                    ${products.map(
                        product => {

                            const isBest =
                                product.rating ===
                                highestRating;


                            return `

                                <td class="${
                                    isBest
                                        ? "best"
                                        : ""
                                }">

                                    <span class="stars">

                                        ${getStars(
                                            product.rating
                                        )}

                                    </span>

                                    ${product.rating.toFixed(
                                        1
                                    )}

                                    ${
                                        isBest
                                            ? " ✓ Highest"
                                            : ""
                                    }

                                </td>

                            `;

                        }
                    ).join("")}

                </tr>


                <!-- CATEGORY -->

                <tr>

                    <th>
                        Category
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${formatCategory(
                                product.category
                            )}

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- BRAND -->

                <tr>

                    <th>
                        Brand
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${escapeHTML(
                                product.brand ||
                                "N/A"
                            )}

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- STOCK -->

                <tr>

                    <th>
                        Stock
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${product.stock}
                            units

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- DISCOUNT -->

                <tr>

                    <th>
                        Discount
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${Math.round(
                                product.discountPercentage
                            )}%

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- WARRANTY -->

                <tr>

                    <th>
                        Warranty
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${escapeHTML(
                                product.warrantyInformation ||
                                "N/A"
                            )}

                        </td>

                    `
                    ).join("")}

                </tr>


                <!-- SHIPPING -->

                <tr>

                    <th>
                        Shipping
                    </th>


                    ${products.map(
                        product => `

                        <td>

                            ${escapeHTML(
                                product.shippingInformation ||
                                "N/A"
                            )}

                        </td>

                    `
                    ).join("")}

                </tr>


            </table>

        </div>

    `;

}


// =============================================
// CLOSE COMPARISON
// =============================================

function closeComparison() {

    comparisonModal.classList.add(
        "hidden"
    );


    document.body.style.overflow =
        "";

}


// =============================================
// HTML ESCAPE
// =============================================

function escapeHTML(value) {

    const div =
        document.createElement(
            "div"
        );


    div.textContent =
        value ?? "";


    return div.innerHTML;

}


// =============================================
// EVENT LISTENERS
// =============================================

searchInput.addEventListener(
    "input",
    filterProducts
);


categoryFilter.addEventListener(
    "change",
    filterProducts
);


sortFilter.addEventListener(
    "change",
    filterProducts
);


floatingCompareBtn.addEventListener(
    "click",
    openComparison
);


closeModal.addEventListener(
    "click",
    closeComparison
);


document
    .querySelector(".modal-overlay")
    .addEventListener(
        "click",
        closeComparison
    );


retryBtn.addEventListener(
    "click",
    fetchProducts
);


closePopup.addEventListener(
    "click",
    hideSimilarPopup
);


/*
 * Close search popup when
 * clicking outside it.
 */

document.addEventListener(
    "click",
    event => {

        if (
            !event.target.closest(
                ".search-wrapper"
            )
        ) {

            hideSimilarPopup();

        }

    }
);


/*
 * Escape key closes popup
 * and comparison modal.
 */

document.addEventListener(
    "keydown",
    event => {

        if (
            event.key === "Escape"
        ) {

            hideSimilarPopup();


            if (
                !comparisonModal
                    .classList
                    .contains("hidden")
            ) {

                closeComparison();

            }

        }

    }
);


// =============================================
// START APPLICATION
// =============================================

fetchProducts();
