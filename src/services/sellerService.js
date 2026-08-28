import api from './api';

/**
 * Upload an image file to online storage via the backend upload service.
 * Returns the public URL of the uploaded image.
 *
 * @param {File} file  - File object from an <input type="file">
 * @param {string} folder - Upload subfolder, e.g. 'seller-logos' or 'seller-banners'
 * @returns {Promise<{url:string, path:string, storage:string}>}
 */
export async function uploadImage(file, folder = 'misc'){
  if (!file) throw new Error('No file provided');
  const form = new FormData();
  form.append('image', file);

  // Jangan set Content-Type secara manual — biarkan browser/axios
  // menambahkan boundary multipart secara otomatis.
  return api.post('/uploads/image', form, {
    params: { folder },
  });
}

/**
 * Upload multiple image files to online storage.
 *
 * @param {File[]} files
 * @param {string} folder
 * @returns {Promise<{urls:Array<{url,path,storage}>}>}
 */
export async function uploadImages(files, folder = 'misc'){
  if (!files || !files.length) throw new Error('No files provided');
  const form = new FormData();
  files.forEach((f) => form.append('images', f));

  return api.post('/uploads/images', form, {
    params: { folder },
    headers: { 'Content-Type': 'multipart/form-data' },
  });
}

export async function applySellerApplication(payload){
  return api.post('/seller/applications', payload);
}

export async function getSellerApplication(){
  return api.get('/seller/application');
}

export async function checkSlugUnique(slug){
  return api.get(`/seller/store/slug/${slug}`);
}

export async function getSellerDashboard(){
  return api.get('/seller/dashboard');
}

export async function getProducts(params = {}){
  return api.get('/seller/products', { params });
}

export async function getProduct(productId){
  return api.get(`/seller/products/${productId}`);
}

export async function createProduct(payload){
  return api.post('/seller/products', payload);
}

export async function updateProduct(productId, payload){
  return api.patch(`/seller/products/${productId}`, payload);
}

export async function deleteProduct(productId){
  return api.delete(`/seller/products/${productId}`);
}

export async function getOrders(){
  return api.get('/seller/orders');
}

export async function getEarnings(){
  return api.get('/seller/earnings');
}

export default {
  uploadImage,
  uploadImages,
  applySellerApplication,
  getSellerApplication,
  checkSlugUnique,
  getSellerDashboard,
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getOrders,
  getEarnings,
};
