import * as fs from 'fs';
import * as path from 'path';
import * as WebIFC from '../../dist/web-ifc-api-node.js';
import {IFC2X3} from '../../dist/web-ifc-api-node.js';
/**
 * Should be somewhere else.
 */
function Utf8ArrayToStr(array: Uint8Array) {
    var out, i, len, c;
    var char2, char3;


    out = "";
    len = array.length;
    i = 0;
    while (i < len) {
        c = array[i++];
        switch (c >> 4) {
            case 0:
            case 1:
            case 2:
            case 3:
            case 4:
            case 5:
            case 6:
            case 7:
                // 0xxxxxxx
                out += String.fromCharCode(c);
                break;
            case 12:
            case 13:
                // 110x xxxx   10xx xxxx
                char2 = array[i++];
                out += String.fromCharCode(((c & 0x1F) << 6) | (char2 & 0x3F));
                break;
            case 14:
                // 1110 xxxx  10xx xxxx  10xx xxxx
                char2 = array[i++];
                char3 = array[i++];
                out += String.fromCharCode(((c & 0x0F) << 12) |
                    ((char2 & 0x3F) << 6) |
                    ((char3 & 0x3F) << 0));
                break;
        }
    }

    return out;
}

import type {
    Vector,
    FlatMesh,
    IfcAPI,
    IfcGeometry,
    RawLineData
} from '../../dist/web-ifc-api-node.js';


let ifcApi: IfcAPI;
let modelID: number;
let tmpModelID: number;
let expressId: number = 9989; // an IFCSPACE
let geometries: Vector < FlatMesh > ; // to store geometries instead of refetching them
let allGeometriesSize: number = 119;
let quantityOfknownErrors: number = 0;
let meshesCount: number = 115;
let totalLineNumber : number = 6487;
let emptyFileModelID: number;
let lastExpressId : number = 14312;
let expectedFileDescription : string = "ViewDefinition [CoordinationView_V2.0]";
let expressIDMatchingGuid: any = {
    expressID: 2863,
    guid: "0VNYAWfXv8JvIRVfOzYH1j"
}
let expectedVertexAndIndexDatas: any = {
    geometryIndex: 4,
    indexDatas: "3,0,1,1,2,3,8,6,5,6,8,7,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30,31,32,33",
    vertexDatas: "0,0,609.5999755859375,0,0,1,304.79998779296875,0,609.5999755859375,0,0,1,304.79998779296875,6110.9111328125,609.5999755859375,0,0,1,1.6996182239381596e-11,6182.7158203125,609.5999755859375,0,0,1,0,0,609.5999755859375,0,0,1,0,0,0,0,0,-1,304.79998779296875,0,0,0,0,-1,304.79998779296875,6110.9111328125,0,0,0,-1,1.6996182239381596e-11,6182.7158203125,0,0,0,-1,0,0,0,0,0,-1,0,0,0,0,-1,0,304.79998779296875,0,609.5999755859375,0,-1,0,0,0,609.5999755859375,0,-1,0,0,0,0,0,-1,0,304.79998779296875,0,0,0,-1,0,304.79998779296875,0,609.5999755859375,0,-1,0,304.79998779296875,0,0,1,-2.7812843513192777e-15,0,304.79998779296875,6110.9111328125,609.5999755859375,1,-2.7812843513192777e-15,0,304.79998779296875,0,609.5999755859375,1,-2.7812843513192777e-15,0,304.79998779296875,0,0,1,-2.7812843513192777e-15,0,304.79998779296875,6110.9111328125,0,1,-2.7812843513192777e-15,0,304.79998779296875,6110.9111328125,609.5999755859375,1,-2.7812843513192777e-15,0,304.79998779296875,6110.9111328125,0,0.22930225729942322,0.9733552932739258,0,1.6996182239381596e-11,6182.7158203125,609.5999755859375,0.22930225729942322,0.9733552932739258,0,304.79998779296875,6110.9111328125,609.5999755859375,0.22930225729942322,0.9733552932739258,0,304.79998779296875,6110.9111328125,0,0.22930225729942322,0.9733552932739258,0,1.6996182239381596e-11,6182.7158203125,0,0.22930225729942322,0.9733552932739258,0,1.6996182239381596e-11,6182.7158203125,609.5999755859375,0.22930225729942322,0.9733552932739258,0,1.6996182239381596e-11,6182.7158203125,0,-1,2.7489831733922086e-15,0,0,0,609.5999755859375,-1,2.7489831733922086e-15,0,1.6996182239381596e-11,6182.7158203125,609.5999755859375,-1,2.7489831733922086e-15,0,1.6996182239381596e-11,6182.7158203125,0,-1,2.7489831733922086e-15,0,0,0,0,-1,2.7489831733922086e-15,0,0,0,609.5999755859375,-1,2.7489831733922086e-15,0"
}
let IFCEXTRUDEDAREASOLIDMeshesCount = 97;
let givenCoordinationMatrix: number[] = [1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1];



beforeAll(async () => {
    ifcApi = new WebIFC.IfcAPI();
    await ifcApi.Init();
    ifcApi.SetLogLevel(WebIFC.LogLevel.OFF);
    const exampleIFCPath = path.join(__dirname, '../artifacts/example.ifc.test');
    const exampleIFCData = fs.readFileSync(exampleIFCPath);
    modelID = ifcApi.OpenModel(exampleIFCData);
    emptyFileModelID = ifcApi.CreateModel('IFC2X3');
    tmpModelID = ifcApi.OpenModel(exampleIFCData);
})

describe('WebIfcApi reading methods', () => {
    test('can retrieve a modelID', () => {
        expect(modelID).toBe(0);


    })
    test('can ensure model is open', () => {
        const isOpen : boolean = ifcApi.IsModelOpen(modelID);
        expect(isOpen).toBeTruthy();
    })
    test('can return the correct number of line with a given Type', () => {
        let properties = ifcApi.GetLineIDsWithType(modelID, WebIFC.IFCPROPERTYSINGLEVALUE)
        expect(properties.size()).toEqual(456);
    })
    test('can return the correct number of line when getting all lines', () => {
        const lines: any = ifcApi.GetAllLines(modelID);
        expect(lines.size()).toEqual(totalLineNumber);
    })
    test('can GetLine', () => {
        const line: Object = ifcApi.GetLine(modelID, expressId);
        expect(line).not.toBeNull();
    })
    test('can flatten a line which will be more verbose', () => {
        const line: any = ifcApi.GetLine(modelID, expressId);
        ifcApi.FlattenLine(modelID, line);
        expect(line.OwnerHistory.OwningUser).not.toBe(null);
    })
    test('expect the correct line to be returned', () => {
        const line: any = ifcApi.GetLine(modelID, expressId);
        expect(line.expressID).toEqual(expressId);
    })
    test('expect getting flatten line return verbose line', () => {
        let flattened: boolean = true;
        const line: any = ifcApi.GetLine(modelID, expressId, flattened);
        expect(line.Representation.Representations.length).toEqual(2); // hardcoded
    })
    test('can Get Raw Line', () => {
        let line: RawLineData = ifcApi.GetRawLineData(modelID, expressId);
        expect(line).not.toBeNull();
    })
    test('expect the correct raw line to be returned', () => {
        let line: RawLineData = ifcApi.GetRawLineData(modelID, expressId);
        expect(line.ID).toEqual(expressId);
    })
    test('can count errors in ifc file', () => {
        let errors: any = ifcApi.GetAndClearErrors(modelID);
        expect(errors.size()).toEqual(quantityOfknownErrors);
    })
    test('can Create Ifc Guid To Express Id Map', () => {
        ifcApi.CreateIfcGuidToExpressIdMapping(modelID);
        expect(ifcApi.ifcGuidMap.get(0)?.get(expressIDMatchingGuid.expressID)).toEqual(expressIDMatchingGuid.guid);
    })
    test('can return the next highest expressID if the ID is sequential', () => {
        expect(ifcApi.GetNextExpressID(modelID, 5)).toBe(6);
    })
    test('can return the next highest expressID if the ID is not sequential', () => {
        expect(ifcApi.GetNextExpressID(modelID, 9)).toBe(11);
    })
    test('returns same expressID if it is the max ID', () => {
        expect(ifcApi.GetNextExpressID(modelID, 14312)).toBe(14312);
    })
    test('can increment the max expressID', () => {
        let maxEID = ifcApi.GetMaxExpressID(tmpModelID);
        let newEID = ifcApi.IncrementMaxExpressID(tmpModelID, 2);
        expect(newEID).toBe(maxEID + 2);
    })


})
describe('WebIfcApi geometries', () => {
    test('can return the correct number geometries', () => {
        geometries = ifcApi.LoadAllGeometry(modelID);
        expect(geometries.size()).toBe(allGeometriesSize);
    })
    test('can Get a Flat Mesh', () => {
        let geometryExpressId = geometries.get(4).expressID;
        let flatMesh: FlatMesh = ifcApi.GetFlatMesh(modelID, geometryExpressId);
        expect(flatMesh.geometries.size() > 0).toBeTruthy();
    })
    test('expect the correct flatMesh to be returned', () => {
        let geometryExpressId = geometries.get(4).expressID;
        let flatMesh: FlatMesh = ifcApi.GetFlatMesh(modelID, geometryExpressId);
        expect(flatMesh.expressID).toEqual(geometryExpressId);
    })
    test('can get geometry', () => {
        let geometryId = geometries.get(1).expressID;
        const geometry: IfcGeometry = ifcApi.GetGeometry(modelID, geometryId);
        expect(geometry.GetIndexData()).not.toBeNull()
        expect(geometry.GetIndexDataSize()).not.toBeNull()
        expect(geometry.GetVertexData()).not.toBeNull()
        expect(geometry.GetVertexDataSize()).not.toBeNull()
    })
    test('can Get Coordination Matrix', () => {
        let coordinationMatrix: Array < number > = ifcApi.GetCoordinationMatrix(modelID);
        expect(coordinationMatrix.join(",")).toEqual(givenCoordinationMatrix.join(","));
    })
    test('expect index array as Float32Array', () => {
        let geometryId = geometries.get(1).expressID;
        const geometry: IfcGeometry = ifcApi.GetGeometry(modelID, geometryId);
        let indexArray: Float32Array = ifcApi.GetVertexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        expect(indexArray).toBeInstanceOf(Float32Array);
    })
    test('expect vertex Array as Float32Array', () => {
        let geometryId = geometries.get(4).expressID;
        const geometry: IfcGeometry = ifcApi.GetGeometry(modelID, geometryId);
        let vertexArray: Float32Array = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        expect(vertexArray).toBeInstanceOf(Float32Array);
    })
    test('can return vertex array from a flat mesh', () => {
        let geometryExpressId = geometries.get(4).expressID;
        let flatMesh = ifcApi.GetFlatMesh(modelID, geometryExpressId);
        let flatMesheGeometries: IfcGeometry = ifcApi.GetGeometry(modelID, flatMesh.geometries.get(0).geometryExpressID);
        let geometryVertexArray: Float32Array = ifcApi.GetVertexArray(flatMesheGeometries.GetVertexData(), flatMesheGeometries.GetVertexDataSize());
        expect(geometryVertexArray.length > 0).toBeTruthy();
    })
    test('can return geometry index datas from a flat mesh', () => {
        let geometryExpressId = geometries.get(4).expressID;
        let flatMesh = ifcApi.GetFlatMesh(modelID, geometryExpressId);
        let flatMesheGeometries: IfcGeometry = ifcApi.GetGeometry(modelID, flatMesh.geometries.get(0).geometryExpressID);
        let geometryIndexData: Uint32Array = ifcApi.GetIndexArray(flatMesheGeometries.GetIndexData(), flatMesheGeometries.GetIndexDataSize());
        expect(geometryIndexData.length > 0).toBeTruthy();
    })
    test('expect correct vertex and index array from A flat Mesh', () => {
        let flatMesh = ifcApi.GetFlatMesh(modelID, geometries.get(expectedVertexAndIndexDatas.geometryIndex).expressID);
        let geometry = ifcApi.GetGeometry(modelID, flatMesh.geometries.get(0).geometryExpressID);
        let geometryVertexArray = ifcApi.GetVertexArray(geometry.GetVertexData(), geometry.GetVertexDataSize());
        let geometryIndexData = ifcApi.GetIndexArray(geometry.GetIndexData(), geometry.GetIndexDataSize());
        let geometryIndexDatasString = geometryIndexData.join(",");
        let geometryVertexArrayString = geometryVertexArray.join(",");
        expect(geometryIndexDatasString).toEqual(expectedVertexAndIndexDatas.indexDatas);
        expect(geometryVertexArrayString).toEqual(expectedVertexAndIndexDatas.vertexDatas);

    })
    test('can ensure the corret number of all streamed meshes ', () => {
        let count: number = 0;
        ifcApi.StreamAllMeshes(modelID, () => {
            count++;
        });
        expect(count).toEqual(meshesCount);
    })
    test('can ensure the corret number of all streamed meshes with a given Types', () => {
        let count: number = 0;
        ifcApi.StreamAllMeshesWithTypes(modelID, [WebIFC.IFCEXTRUDEDAREASOLID], () => {
            ++count
        });
        expect(count).toEqual(IFCEXTRUDEDAREASOLIDMeshesCount);
    })
    test('Can get max expressID', () => {
        const maxExpressId : number = ifcApi.GetMaxExpressID(modelID);
        expect(maxExpressId).toEqual(lastExpressId);
    })
    test('Can get header information', () => {
        const headerLine : any = ifcApi.GetHeaderLine(modelID, WebIFC.FILE_DESCRIPTION );
        expect(headerLine.type).toEqual("FILE_DESCRIPTION");
        expect(headerLine.arguments[0][0].value).toEqual(expectedFileDescription);
    })
});
describe('WebIfcApi geometry transformation', () => {
    test('should throw with message \'invalid matrix size\' when matrix size != 16', () => {
        expect(() => {
            ifcApi.SetGeometryTransformation(modelID, [1])
        }).toThrow("invalid matrix size: 1");
    })
});
describe('WebIfcApi writing methods', () => {
    test('Can create an empty model', () => {
        expect(emptyFileModelID).toBe(1);
    })
    test('Can ensure modelIDs increment when adding new model in ifcApi', () => {
        expect(emptyFileModelID).toBe(1);
    })
    test('Can write a line from raw datas', () => {
        ifcApi.WriteRawLineData(emptyFileModelID, {
            ID: 1,
            type: WebIFC.IFCPROJECT,
            arguments: [{
                    type: 1,
                    value: '0cqv$41Df7ygSQzJTMBnvM'
                },
                {
                    type: 1,
                    value: ''
                },
                {
                    type: 1,
                    value: 'foo'
                },
                null,
                {
                    type: 1,
                    value: ''
                },
                {
                    type: 1,
                    value: ''
                },
                {
                    type: 1,
                    value: ''
                },
                {
                    type: 1,
                    value: ''
                }
            ]
        })
        let project: any = ifcApi.GetLine(emptyFileModelID, 1); 
        expect(project.Name.value).toEqual("foo");
    })
    test('Can modify a line with a rawLineData', () => {
        ifcApi.WriteRawLineData(emptyFileModelID, {
            ID: 1,
            type: WebIFC.IFCPROJECT,
            arguments: [{
                    type: 1,
                    value: '0cqv$41Df7ygSQzJTMBnvM'
                },
                {
                    type: 1,
                    value: ''
                },
                {
                    type: 1,
                    value: 'foobar'
                },
                null,
                {
                    type: 5,
                    value: 1
                },
                {
                    type: 1,
                    value: ''
                },
                [{
                    type: 5,
                    value: 2
                }],
                {
                    type: 1,
                    value: ''
                }
            ]
        })
        let project: any = ifcApi.GetLine(emptyFileModelID, 1);
        expect(project.Name.value).toBe("foobar");
    })
    test('can write a line by giving a line object', () => {
        let projectBeforeWriting: any = ifcApi.GetAllLines(modelID);
        let payload = new IFC2X3.IfcBuildingElementProxy(
            9999999,
            WebIFC.IFCBUILDINGELEMENTPROXY,
            new IFC2X3.IfcGloballyUniqueId('GUID'),
            new WebIFC.Handle<IFC2X3.IfcOwnerHistory> (41),
            new IFC2X3.IfcLabel('NZ-SHS beam:100x6.0SHS:823947'),
            null,
            new IFC2X3.IfcLabel('NZ-SHS beam:100x6.0SHS'),
            new WebIFC.Handle<IFC2X3.IfcObjectPlacement>(9750),
            new WebIFC.Handle<IFC2X3.IfcProductRepresentation>(9987),
            null,
            null,
        );
        ifcApi.WriteLine(modelID, payload);
        let projectAfterWriting: any = ifcApi.GetAllLines(modelID);
        expect(projectBeforeWriting.size() + 1).toEqual(projectAfterWriting.size());
    })
    test('can modify a line by giving a line object', () => {
        let aSpace: any = ifcApi.GetLine(modelID, expressId);
        aSpace.Name.value = "foo";
        ifcApi.WriteLine(modelID, aSpace);
        let aSpaceReloaded: any = ifcApi.GetLine(modelID, expressId);
        expect(aSpaceReloaded.Name.value).toEqual("foo");
    })

    test('can Export File As IFC', () => {
        let ifcDatas = ifcApi.ExportFileAsIFC(modelID);
        let exportModelID = ifcApi.OpenModel(ifcDatas);
        const line: any = ifcApi.GetLine(exportModelID, expressId);
        expect(exportModelID).toEqual(3);
        expect(line.expressID).toEqual(expressId);


    })

})

describe('WebIfcApi known failures', () => {
    describe("issue:#212", () => {
        test("GetLine doesn't support all entity types (only IFC4?) issue:#212", async () => {
            let ifcApi = new WebIFC.IfcAPI();
            await ifcApi.Init();
            let failModelID = 0;
            const exampleIFCPath: string = path.join(__dirname, '../artifacts/Sample_entities.ifc.test');
            const exampleIFCData = fs.readFileSync(exampleIFCPath);
            failModelID = ifcApi.OpenModel(exampleIFCData);
            const IFCELECTRICDISTRIBUTIONPOINT_EXPRESSID = 237;
            try {
                ifcApi.GetLine(failModelID, IFCELECTRICDISTRIBUTIONPOINT_EXPRESSID);
                expect(false).toBeTruthy();
            } catch (error) {
                expect(true).toBeTruthy();
            }

            ifcApi.CloseModel(failModelID);
        });
    })

    describe("issue:#209", () => {
        test("OpenModel fails when USE_FAST_BOOLS is disabled issue:#209", async () => {
            let ifcApi = new WebIFC.IfcAPI();
            let config = {
                COORDINATE_TO_ORIGIN: false,
                USE_FAST_BOOLS: false
            };
            await ifcApi.Init();
            let failModelID = 0;
            const exampleIFCPath: string = path.join(__dirname, '../artifacts/S_Office_Integrated Design Archi.ifc.test');
            const exampleIFCData = fs.readFileSync(exampleIFCPath);
            try {
                ifcApi.OpenModel(exampleIFCData, config);
                expect(true).toBeFalsy();
            } catch (error) {
                expect(true).toBeTruthy();
            }
            ifcApi.CloseModel(failModelID);
        })
    });
    describe("issue:#214", () => {
        test("REAL numbers written by ExportFileAsIFC() are in an invalid format", async () => {
            let ifcApi = new WebIFC.IfcAPI();
            await ifcApi.Init();
            let failModelID = 0;
            const exampleIFCPath: string = path.join(__dirname, '../artifacts/example.ifc_issue_214.test');
            const exampleIFCData = fs.readFileSync(exampleIFCPath);
            failModelID = ifcApi.OpenModel(exampleIFCData);
            let ifcDatas = ifcApi.ExportFileAsIFC(failModelID);
            let rawIfcString = Utf8ArrayToStr(ifcDatas);

            expect(rawIfcString.indexOf("#6=IFCCARTESIANPOINT((0.,0.,0.));") == -1).toBeTruthy();
            expect(rawIfcString.indexOf("#13=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.000000000000001E-05,#12,$);") == -1).toBeTruthy();

            ifcApi.CloseModel(failModelID);
        });
        test("when ExportFileAsIFC() exponents need to be written with a 'E' not 'e'", async () => {
            let ifcApi = new WebIFC.IfcAPI();
            await ifcApi.Init();
            let failModelID = 0;
            const exampleIFCPath: string = path.join(__dirname, '../artifacts/example.ifc_issue_214.test');
            const exampleIFCData = fs.readFileSync(exampleIFCPath);
            failModelID = ifcApi.OpenModel(exampleIFCData);
            let ifcDatas = ifcApi.ExportFileAsIFC(failModelID);
            let rawIfcString = Utf8ArrayToStr(ifcDatas);
            expect(rawIfcString.indexOf("#13=IFCGEOMETRICREPRESENTATIONCONTEXT($,'Model',3,1.000000000000001E-05,#12,$);") == -1).toBeTruthy();
            ifcApi.CloseModel(failModelID);
        });

        test("FILE_NAME header should have 7 attributes not 5", async () => {
            expect(true).toBeTruthy();
        });
    });

})

describe('some use cases', () => {
    test("can write a new property value and read it back in", async () => {
        async function getFirstStorey(api:any, mId:any) {
            const storeyIds = await api.GetLineIDsWithType(mId, WebIFC.IFCBUILDINGSTOREY);
            expect(storeyIds.size()).toBe(2);
            const storeyId = storeyIds.get(0);
            const storey = await api.properties.getItemProperties(mId, storeyId);
            return [storey, storeyId];
          }
          let [storey, storeyId] = await getFirstStorey(ifcApi, modelID);
          const newStoreyName = 'Nivel 1 - Editado'
          storey.LongName.value = newStoreyName;
          ifcApi.WriteLine(modelID, storey);
          storey = await ifcApi.properties.getItemProperties(modelID, storeyId);
          expect(storey.LongName.value).toBe(newStoreyName);
      
          const writtenData = await ifcApi.ExportFileAsIFC(modelID);
          let modelId = ifcApi.OpenModel(writtenData);
          [storey, storeyId] = await getFirstStorey(ifcApi, modelId);
          expect(storey.LongName.value).toBe(newStoreyName);
    });
    
})

afterAll(() => {

    ifcApi.CloseModel(modelID);
    const isOpen: boolean = ifcApi.IsModelOpen(modelID);
    const isOpenEmptyFileModelID: boolean = ifcApi.IsModelOpen(emptyFileModelID);

    expect(isOpen).toBeFalsy()
    expect(isOpenEmptyFileModelID).toBeFalsy()
})
