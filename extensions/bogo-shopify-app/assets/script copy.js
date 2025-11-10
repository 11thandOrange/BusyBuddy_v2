// class BogoBundle {
//   constructor() {
//     this.settings = {};
//     this.selectors = {
//       price: '[id^="product-price-"], .price, [class*="product-price"], .product__price',
//       button: '[type="submit"][name="add"], .product-form__submit, #AddToCart',
//       description: '[class*="description"], #productDescription, .product__description'
//     };
//   }

//   async init() {
//     await this.loadSettings();
//     await this.loadBundleData();
//     this.positionBundle();
//   }

//   async loadSettings() {
//     // Get settings from section JSON
//     const section = document.querySelector('[data-section-id]');
//     if (section) {
//       this.settings = JSON.parse(section.dataset.sectionSettings || '{}');
//     }
//   }

//   async loadBundleData() {
//     const productId = window.location.pathname.split('/').pop();
//     try {
//       const response = await fetch(`/apps/bogo-app/bundle?product_id=${productId}`);
//       this.bundleData = await response.json();
//     } catch (error) {
//       console.error('Error loading bundle data:', error);
//     }
//   }

//   positionBundle() {
//     const container = document.getElementById('bogoApp');
//     if (!container || !this.bundleData) return;

//     container.innerHTML = this.generateHTML();
    
//     switch (this.settings.placement) {
//       case 'after_price':
//         this.insertAfterSelector(this.selectors.price, container);
//         break;
//       case 'before_button':
//         this.insertBeforeSelector(this.selectors.button, container);
//         break;
//       case 'after_description':
//         this.insertAfterSelector(this.selectors.description, container);
//         break;
//       case 'custom':
//         if (this.settings.custom_selector) {
//           this.insertAfterSelector(this.settings.custom_selector, container);
//         } else {
//           this.fallbackPosition(container);
//         }
//         break;
//       default:
//         this.fallbackPosition(container);
//     }
//   }

//   insertAfterSelector(selector, element) {
//     const target = document.querySelector(selector);
//     if (target && target.parentNode) {
//       target.parentNode.insertBefore(element, target.nextSibling);
//       return true;
//     }
//     return false;
//   }

//   insertBeforeSelector(selector, element) {
//     const target = document.querySelector(selector);
//     if (target && target.parentNode) {
//       target.parentNode.insertBefore(element, target);
//       return true;
//     }
//     return false;
//   }

//   fallbackPosition(element) {
//     // Try common product containers
//     const containers = [
//       'main.product',
//       '[id^="ProductSection"]',
//       '.product-single',
//       '.product__main'
//     ];
    
//     for (const selector of containers) {
//       const container = document.querySelector(selector);
//       if (container) {
//         container.appendChild(element);
//         return;
//       }
//     }
    
//     // Ultimate fallback
//     document.body.appendChild(element);
//   }

//   generateHTML() {
//     return `
//       <div class="bogo-bundle">
//         <h3>Buy this bundle and save!</h3>
//         ${this.bundleData.items.map(item => `
//           <div class="bundle-item">
//             <div class="item-name">${item.name}</div>
//             <div class="item-prices">
//               <span class="original-price">${item.originalPrice}</span>
//               <span class="discounted-price">${item.discountedPrice}</span>
//             </div>
//           </div>
//         `).join('')}
//         <div class="bundle-total">
//           <span>Total:</span>
//           <span class="total-price">${this.bundleData.totalPrice}</span>
//         </div>
//         <button class="bundle-add-to-cart">Add Bundle to Cart</button>
//       </div>
//     `;
//   }
// }

// // Initialize when DOM is ready
// document.addEventListener('DOMContentLoaded', () => {
//   const bogoBundle = new BogoBundle();
//   bogoBundle.init();
// });