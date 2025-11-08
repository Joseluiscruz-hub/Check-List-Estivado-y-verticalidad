
import type { Verification, PhotoRecord, ProductSessionState } from '../types';

const DB_NAME = 'ChecklistDB_React';
const DB_VERSION = 1;
let db: IDBDatabase | null = null;

const ensureDB = (): IDBDatabase => {
    if (!db) throw new Error('IndexedDB no inicializada. Llama a initDB() primero.');
    return db;
};

export const initDB = (): Promise<boolean> => {
    return new Promise((resolve, reject) => {
        if (!('indexedDB' in window)) {
            reject(new Error('IndexedDB no es soportado por este navegador'));
            return;
        }

        const request = indexedDB.open(DB_NAME, DB_VERSION);

        request.onerror = (ev) => {
            const err = (ev.target as IDBOpenDBRequest).error ?? new Error('Error desconocido al abrir DB');
            reject(err);
        };

        request.onsuccess = (event) => {
            db = (event.target as IDBOpenDBRequest).result;
            resolve(true);
        };

        request.onupgradeneeded = (event) => {
            const database = (event.target as IDBOpenDBRequest).result;
            if (!database.objectStoreNames.contains('verifications')) {
                const store = database.createObjectStore('verifications', { keyPath: 'id', autoIncrement: true });
                store.createIndex('sku', 'sku', { unique: false });
                store.createIndex('fecha', 'fecha', { unique: false });
            }
            if (!database.objectStoreNames.contains('photos')) {
                const store = database.createObjectStore('photos', { keyPath: 'id', autoIncrement: true });
                store.createIndex('verificacion_id', 'verificacion_id', { unique: false });
            }
        };
    });
};

export const addVerificationAndPhotos = (product: ProductSessionState): Promise<void> => {
    return new Promise((resolve, reject) => {
        let dbInstance: IDBDatabase;
        try {
            dbInstance = ensureDB();
        } catch (err) {
            reject(err);
            return;
        }

        const transaction = dbInstance.transaction(['verifications', 'photos'], 'readwrite');
        const verificationsStore = transaction.objectStore('verifications');
        const photosStore = transaction.objectStore('photos');

        const verification: Verification = {
            sku: product.sku,
            descripcion: product.descripcion,
            factorEstiba: product.factorEstiba,
            status: product.status as 'ok' | 'error',
            fecha: new Date().toISOString(),
            inspector: product.inspector,
            turno: product.turno,
            ubicacion: product.ubicacion,
            observaciones: product.notes,
            parametros: product.parametros,
            total_fotos: product.fotos_adjuntas,
        };

        const addRequest = verificationsStore.add(verification);
        addRequest.onsuccess = () => {
            const verificationId = addRequest.result as number;
            if (product.fotos_adjuntas > 0 && product.fotos) {
                for (const [param, photoData] of Object.entries(product.fotos)) {
                    const photoRecord: Omit<PhotoRecord, 'id'> = {
                        verificacion_id: verificationId,
                        parametro: param,
                        blob: photoData as any,
                        fecha: new Date().toISOString(),
                    };
                    photosStore.add(photoRecord);
                }
            }
        };

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Error en transacción'));
    });
};

export const getVerifications = (): Promise<Verification[]> => {
    return new Promise((resolve, reject) => {
        let dbInstance: IDBDatabase;
        try {
            dbInstance = ensureDB();
        } catch (err) {
            reject(err);
            return;
        }

        const transaction = dbInstance.transaction('verifications', 'readonly');
        const store = transaction.objectStore('verifications');
        const request = store.getAll();
        request.onsuccess = () => resolve(request.result as Verification[]);
        request.onerror = () => reject(request.error ?? new Error('Error leyendo verifications'));
    });
};

export const getVerificationById = (id: number): Promise<Verification | undefined> => {
    return new Promise((resolve, reject) => {
        let dbInstance: IDBDatabase;
        try {
            dbInstance = ensureDB();
        } catch (err) {
            reject(err);
            return;
        }

        const transaction = dbInstance.transaction('verifications', 'readonly');
        const store = transaction.objectStore('verifications');
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result as Verification | undefined);
        request.onerror = () => reject(request.error ?? new Error('Error leyendo verification por id'));
    });
}

export const getPhotosForVerification = (verificationId: number): Promise<PhotoRecord[]> => {
    return new Promise((resolve, reject) => {
        let dbInstance: IDBDatabase;
        try {
            dbInstance = ensureDB();
        } catch (err) {
            reject(err);
            return;
        }

        const transaction = dbInstance.transaction('photos', 'readonly');
        const store = transaction.objectStore('photos');
        const index = store.index('verificacion_id');
        const request = index.getAll(verificationId);
        request.onsuccess = () => resolve(request.result as PhotoRecord[]);
        request.onerror = () => reject(request.error ?? new Error('Error leyendo photos'));
    });
};

export const deleteAllData = (): Promise<void> => {
     return new Promise((resolve, reject) => {
        let dbInstance: IDBDatabase;
        try {
            dbInstance = ensureDB();
        } catch (err) {
            reject(err);
            return;
        }

        const transaction = dbInstance.transaction(['verifications', 'photos'], 'readwrite');
        const verificationsStore = transaction.objectStore('verifications');
        const photosStore = transaction.objectStore('photos');

        const clear1 = verificationsStore.clear();
        const clear2 = photosStore.clear();

        // handle possible errors on clears
        clear1.onerror = () => reject(clear1.error ?? new Error('Error clearing verifications'));
        clear2.onerror = () => reject(clear2.error ?? new Error('Error clearing photos'));

        transaction.oncomplete = () => resolve();
        transaction.onerror = () => reject(transaction.error ?? new Error('Error en transacción de borrado'));
    });
}
