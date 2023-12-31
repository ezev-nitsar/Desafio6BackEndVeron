import { productModel } from "../models/product.model.js";
export class ProductManager {
    constructor(fileName = "") {
        //Array vacío, se deja filename por compatibilidad con fs
        this.products = [];
    }

        //Función que devuelve todos los productos
    getProducts = async () => {
        let productos = [];
        try {
            productos = await productModel.find().lean();
        } catch (error) {
            console.log("ERROR: " +  error);
        }
        return productos;
    }
    //Función que busca un Producto por ID
    getProductById = async (id) => {
        let productoEncontrado = false;
        try {
            productoEncontrado = await productModel.find({ id: id });
        }
        catch (error) {
            console.log("ERROR: " +  error);
        }   
        
        //Si no hay resultados, devuelvo el error
        if (productoEncontrado.length === 0) {
            return false;
        } else {
            return productoEncontrado;
        }
    }
    //Función que agrega productos
    addProduct = async (producto) => {
        //Lectura inicial de todos los productos
        this.products = await this.getProducts();
        let status = true;
        
        //Verifico que todos los campos estén seteados y que price y stock sean numéricos
        if (!producto.title || !producto.description || !producto.price || isNaN(producto.price) || !producto.code || !producto.stock || isNaN(producto.stock)) {
            return '{"status": "failed", "message": "Validation error. Please review your inputs and try again"}';
        }
       if (producto.status != undefined) {
            status = producto.status;
        }
        //Valido que ya no exista un producto con el mismo código
     if (this.products.find(x => x.code === producto.code)) {
            return '{"status": "failed", "message": "Product code already used"}';
        } else {
            // Todo OK, avanzo con la creación del objecto Product con los datos pasados por parámetros
            const title = producto.title;
            const description = producto.description;
            const price = producto.price;
            const thumbnails = producto.thumbnails;
            const code = producto.code;
            const stock = producto.stock;
            const product = {
                title,
                description,
                price,
                thumbnails,
                code,
                stock,
                status
            }
            if (this.products.length === 0) {
                product.id = 1;
            } else {
                //De esta forma, no se repite el ID si se borra un producto
                const nuevoId = Math.max(...this.products.map(x => x.id));
                product.id = nuevoId + 1;
            }

            try {
                await productModel.create({ id: product.id, title: product.title, description: product.description, price: product.price, thumbnails: product.thumbnails, code: product.code, stock: product.stock, status: product.status });
                this.products.push(product);
                return '{"status":"ok"}';
            } catch {
                return '{"status":"failed", "message":"' + error + '"}';
            }
        }
    }
    updateProduct = async (id, productDetails) => {
        //Lectura inicial de todos los productos
        this.products = await this.getProducts();
        const productoEncontrado = await productModel.find({ id: id });
        if (productoEncontrado.length === 0) {
            return '{"status": "failed", "message": "Product does not exists"}';
        } else {
            //Inicialmente, seteo los valores originales del producto
            let title = productoEncontrado.title;
            let description = productoEncontrado.description;
            let price = productoEncontrado.price;
            let thumbnails = productoEncontrado.thumbnails;
            let code = productoEncontrado.code;
            let stock = productoEncontrado.stock;
            let status = productoEncontrado.status;
            //Busco en el objeto enviado, si el campo está seteado y es válido, lo actualizo
            if (productDetails.title) {
                title = productDetails.title;
            }
            if (productDetails.description) {
                description = productDetails.description;
            }
            if (productDetails.price) {
                price = productDetails.price;
            }
            if (productDetails.thumbnails) {
                thumbnails = productDetails.thumbnails;
            }
            if (productDetails.code || !isNaN(productDetails.code)) {
                code = productDetails.code;
            }
            if (productDetails.stock || !isNaN(productDetails.stock)) {
                stock = productDetails.stock;
            }
            if (productDetails.status != undefined) {
                status = productDetails.status;
            }
            const product = {
                title,
                description,
                price,
                thumbnails,
                code,
                stock,
                status,
                id
            }
            //Busco el producto y lo actualizo
            const actualizar = this.products.findIndex(obj => obj.id === id);
            this.products[actualizar] = product;

            try {
                await productModel.updateOne( {id: id}, {title: product.title, description: product.description, price: product.price, thumbnails: product.thumbnails, code: product.code, stock: product.stock, status: product.status})
            } catch (error) {
                console.log("ERROR: " + error);
            }
            return '{"status":"ok"}';
        }
    }

    deleteProduct = async (id) => {
        //Lectura inicial de todos los productos
        this.products = await this.getProducts();
        const productoEncontrado = await productModel.find({ id: id });
        if (productoEncontrado.length === 0) {
            return '{"status": "failed", "message": "Product does not exists"}';
        } else {
            //Busco el producto y lo elimino
            const nuevosProductos = this.products.filter(x => x.id !== id);
            this.products = nuevosProductos;

            try {
               await productModel.deleteOne({ id: id });
            } catch (error) {
                console.log("ERROR: " + error);
            }
            return '{"status":"ok"}';
        }
    }
}