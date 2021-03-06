const Proyecto = require("../models/Proyecto");
const {validationResult}= require('express-validator')


exports.crearProyecto = async (req, res) => {
   //REVISAR SI HAY ERRORES
   const errores = validationResult(req);

   if (!errores.isEmpty()) {
     return res.status(400).json({ errores: errores.array() });
   }
 

  try {
    //CREAR UN NUEVO PROYECTO
    const proyecto = new Proyecto(req.body);
    //GUARDAR EL CREADOR VIA JWT
    proyecto.creador = req.usuario.id
//GUARDAR EL PROYECTO
    proyecto.save();
    res.json(proyecto);
  } catch (error) {
   
    res.status(500).send("Hubo un error en el servidor");
  }
};

//OBTIENE TODO LOS PROYECTOS DEL USUARIO ACTUAL
exports.obtenerProyectos = async(req,res)=>{
try {

  const proyectos = await Proyecto.find({creador:req.usuario.id}).sort({creado:-1})
res.json({proyectos})

  
} catch (error) {
  console.log(error)
  res.status(500).json({msg:'Hubo un error en el servidor'})
}

}

//ACTUALIZAR UN PROYECTO 
exports.actualizarProyecto =async(req,res)=>{
  //REVISAR SI HAY ERRORES
  const errores = validationResult(req);

  if (!errores.isEmpty()) {
    return res.status(400).json({ errores: errores.array() });
  }

  //EXTRAER LA INFORMACION DEL PROYECTO
  const {nombre}=req.body
  const nuevoProyecto = {}
  if(nombre){
    nuevoProyecto.nombre = nombre 
  }

try {
  //REVISAR EL ID
let proyecto = await  Proyecto.findById(req.params.id)
  //SI EL PROYECTO EXISTE O NO 
if(!proyecto){
  return res.status(404).json({msg:'Proyecto no encontrado'})
}

 //VERIFICAR EL CREADOR DEL PROYECTO
  if(proyecto.creador.toString()!== req.usuario.id){
    return res.status(401).json({msg:'No autorizado'})
  }
 // ACTUALIZAR  
proyecto = await Proyecto.findByIdAndUpdate({_id:req.params.id},{$set:nuevoProyecto},{new:true})

res.json({proyecto})

} catch (error) {
  console.log(error)
  res.status(500).json({msg:'Error en el servidor'})
}


}

// Elimina un proyecto por su id
exports.eliminarProyecto = async (req, res ) => {
    try {
        // revisar el ID 
        let proyecto = await Proyecto.findById(req.params.id);

        // si el proyecto existe o no
        if(!proyecto) {
            return res.status(404).json({msg: 'Proyecto no encontrado'})
        }

        // verificar el creador del proyecto
        if(proyecto.creador.toString() !== req.usuario.id ) {
            return res.status(401).json({msg: 'No Autorizado'});
        }

        // Eliminar el Proyecto
        await Proyecto.findOneAndRemove({ _id : req.params.id });
        res.json({ msg: 'Proyecto eliminado '})

    } catch (error) {
        console.log(error);
        res.status(500).send('Error en el servidor')
    }
}