import { iPgHandler } from "../data/instances";

export default class Template{
    static async create_template({
        id_user,
        de_template,
        co_template,
        id_type
    }: {
        id_user: number,
        de_template: string, // Nombre del template
        co_template: string, // Contenido del template
        id_type: number // Tipo de template (email o SMS)
    }) {
        try {
            // Crear el template
            const result = await iPgHandler.executeQuery({
                key: "createTemplate",
                params: [id_user, de_template, co_template, id_type]
            });

            console.log("Response from createTemplate:", result);

            // Validar la estructura de la respuesta
            if (!Array.isArray(result) || result.length === 0 || !result[0]?.id_template) {
                throw new Error("Failed to create template");
            }

            const id_template = result[0].id_template;

            return { success: true, message: "Template created successfully", id_template };
        } catch (error) {
            console.error(`Error creating template: ${error}`);
            throw error;
        }
    }

    static async edit_template({id_template, de_template, co_template, id_type}: {id_template: number, de_template: string, co_template: string, id_type: number}){
        // Implementar la lógica para editar un template
        try {
            const result = iPgHandler.executeQuery({
                key: "editTemplate",
                params: [de_template, co_template, id_type, id_template]
            })

            console.log("Response from editTemplate:", result);

            return { success: true, message: "Template edited successfully!!" };

            } catch (error) {
                console.error(`Error editing template: ${error}`);
                throw error;
            }
        }


        static async delete_template({id_template}: {id_template: number}){
            // Implementar la lógica para eliminar un template
            try {
                const result = iPgHandler.executeQuery({
                    key: "deleteTemplate",
                    params: [id_template]
                })

                console.log("Response from deleteTemplate:", result);

                return { success: true, message: "Template deleted successfully!!" };

                } catch (error) {
                    console.error(`Error deleting template: ${error}`);
                    throw error;
                }
            }


    static async get_all_template(){
        try {
            const result = await iPgHandler.executeQuery({
                key: "getAllTemplates",
                params: []
            });

            console.log("Response from getAllTemplates:", result);

            // Validar la estructura de la respuesta
            if (!Array.isArray(result)) {
                throw new Error("Failed to fetch templatessdf");
            }

            return { success: true, templates: result };
        } catch (error) {
            console.error(`Error fetching templates: ${error}`);
            throw error;
        }
    }
    
}

