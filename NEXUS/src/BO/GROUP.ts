
import { iPgHandler } from "../data/instances";

export default class Group {
    static async create_group({
        id_user,
        id_type,
        de_group,
        co_saved_list
    }: {
        id_user: number,
        id_type: number,
        de_group: string,
        co_saved_list: string[] // Array de correos o números
    }) {
        try {
            // Crear el grupo
            const result = await iPgHandler.executeQuery({
                key: "createGroup",
                params: [id_user, id_type, de_group]
            });
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
    
            const group: { id_group: number }[] = result;
    
            console.log("Response from createGroup:", group);
    
            // Ajustar validación según la estructura de la respuesta
            if (!group || !group[0]?.id_group) {
                throw new Error("Failed to create group");
            }
    
            const id_group = group[0].id_group;
    
            // Iterar sobre el array de co_saved y asociarlos al grupo
            for (const co_saved of co_saved_list) {
                console.log(`Adding to group: id_group=${id_group}, co_saved=${co_saved}`);
                const id_saved = await Group.add_to_saved({ id_type, co_saved }); // Cambiado a Group.add_to_saved
    
                // Asociar el id_saved al grupo
                await iPgHandler.executeQuery({
                    key: "savetoGroup",
                    params: [id_group, id_saved]
                });
            }
    
            return { success: true, message: "Group created and members added successfully", id_group };
        } catch (error) {
            console.error(`Error creating group and adding members: ${error}`);
            throw error;
        }
    }

    static async add_to_saved({
        id_type,
        co_saved
    }: {
        id_type: number,
        co_saved: string;
    }) {
        try {
            // Verificar si el co_saved ya existe en la base de datos
            const existingData = await iPgHandler.executeQuery({
                key: "checkData",
                params: [co_saved]
            });
            console.log(`Existing data for co_saved=${co_saved}:`, existingData);
    
            let id_saved;
            if (Array.isArray(existingData) && existingData.length > 0) {
                // Si existe, usar el ID existente
                id_saved = existingData[0].id_saved;
            } else {
                // Si no existe, agregarlo a la base de datos
                const newSaved = await iPgHandler.executeQuery({
                    key: "saved",
                    params: [id_type, co_saved]
                });
                console.log("Response from saved query:", newSaved);
    
                // Ajustar validación según la estructura de la respuesta
                if (Array.isArray(newSaved) && newSaved.length > 0 && 'id_saved' in newSaved[0]) {
                    id_saved = newSaved[0].id_saved;
                } else {
                    throw new Error("Unexpected response structure for newSaved");
                }
            }
    
            return id_saved;
        } catch (error) {
            console.error(`Error adding to saved: ${error}`);
            throw error;
        }
    }

    static async add_to_group({
        id_type,
        id_group,
        co_saved
    }: {
        id_type: number,
        id_group: number;
        co_saved: string | string[]; // Puede ser un string o un array de strings
    }) {
        try {
            if (Array.isArray(co_saved)) {
                // Si co_saved es un array, iterar sobre los elementos
                for (const single_co_saved of co_saved) {
                    console.log(`Adding to group: id_group=${id_group}, co_saved=${single_co_saved}`);
                    const id_saved = await Group.add_to_saved({ id_type, co_saved: single_co_saved });
    
                    // Asociar el ID al grupo
                    console.log(`Saving to group: id_group=${id_group}, id_saved=${id_saved}`);
                    await iPgHandler.executeQuery({
                        key: "savetoGroup",
                        params: [id_group, id_saved]
                    });
                }
            } else {
                // Si co_saved es un string, manejarlo como un solo elemento
                console.log(`Adding to group: id_group=${id_group}, co_saved=${co_saved}`);
                const id_saved = await Group.add_to_saved({ id_type, co_saved });
    
                // Asociar el ID al grupo
                console.log(`Saving to group: id_group=${id_group}, id_saved=${id_saved}`);
                await iPgHandler.executeQuery({
                    key: "savetoGroup",
                    params: [id_group, id_saved]
                });
            }
    
            return { success: true, message: "Added to group successfully" };
        } catch (error) {
            console.error(`Error adding to group: ${error}`);
            throw error;
        }
    }

    static async obtain_all_group(){
        try {
            const result = await iPgHandler.executeQuery({
                key: "obtainAllGroup",
                params: []
            });

            console.log(result)
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
    
            return result;
        } catch (error) {
            console.error(`Error obtaining all groups: ${error}`);
            throw error;
        }
    }

    static async delete_group({
        id_group
    }: {
        id_group: number;
    }) {
        try {
            const result = await iPgHandler.executeQuery({
                key: "deleteGroup",
                params: [id_group]
            });
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
    
            return { success: true, message: "Group deleted successfully" };
        } catch (error) {
            console.error(`Error deleting group: ${error}`);
            throw error;
        }
    }

    static async obtain_member_group({
        id_group
    }: {
        id_group: number;
    }) {
        try {
            const result = await iPgHandler.executeQuery({
                key: "obtainMembersGroup",
                params: [id_group]
            });
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
            console.log(result)
    
            return result;
        } catch (error) {
            console.error(`Error obtaining group and members: ${error}`);
            throw error;
        }
    }

    static async delete_member_group({
        id_group,
        id_saved
    }: {
        id_group: number;
        id_saved: number;
    }) {
        try {
            const result = await iPgHandler.executeQuery({
                key: "deleteMemberGroup",
                params: [id_group, id_saved]
            });
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
    
            return { success: true, message: "Member deleted from group successfully" };
        } catch (error) {
            console.error(`Error deleting member from group: ${error}`);
            throw error;
        }
    }

    static async edit_group({
        de_group,
        id_group
    }: {
        de_group: string;
        id_group: number;
    }) {
        try {
            const result = await iPgHandler.executeQuery({
                key: "editGroup",
                params: [de_group, id_group]
            });
    
            if (!Array.isArray(result)) {
                throw new Error(`Unexpected response structure: ${JSON.stringify(result)}`);
            }
    
            return { success: true, message: "Group edited successfully" };
        } catch (error) {
            console.error(`Error editing group: ${error}`);
            throw error;
        }
    }
}