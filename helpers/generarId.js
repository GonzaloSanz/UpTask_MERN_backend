import crypto from 'crypto';

const generarId = () => {
    return crypto.randomUUID(); 
}

export default generarId;