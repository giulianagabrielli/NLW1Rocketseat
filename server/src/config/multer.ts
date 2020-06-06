//npm install multer
//npm install @types/multer -d

import multer from 'multer';
import path from 'path'; //para lidar com caminhos em so diferentes
import crypto from 'crypto';

export default {
    storage: multer.diskStorage({
        destination: path.resolve(__dirname, '..', '..', 'uploads'),
        filename(request, file, callback){
            const hash = crypto.randomBytes(6).toString('hex');
            const fileName = `${hash}-${file.originalname}`;
            callback(null, fileName); //primeiro parâmetro é um erro mas como é difícil dar erro com o crypto, entao fica null
        }
    }),
}