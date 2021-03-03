import { AnchorButton, Code, Collapse, Divider, InputGroup, Tab, TabId, Tabs } from "@blueprintjs/core";

import { stat } from "fs";
import React from "react";
import { AddressClassProfile, AddressComponentProfile, AddressProfile, FormTemplate } from "./AddressProfile";


import log from "electron-log"
import { info } from "console";
Object.assign(console, log);

export class LayoutPanel extends React.Component<LayoutPanelProps, any> {
    constructor(props){
        super(props);
        this.state={
            currentClassProfile: null,
            currentAddressProfile: this.props.currentAddressProfile,
            changeStateHandler: this.props.changeStateHandler,

            selectedTabId: "formTemplate",
        }
    }

    render(){
        return (
            <div style={{margin:"5px"}}>
                <div style={{borderRadius: "5px", backgroundColor: "#FFF", padding:"5px",}}>
                    <div>
                        <span style={{fontSize:"16px",}}>Address Class Profile:&nbsp;</span>
                        <select style={{display:"inline",}} value={this.state.currentClassProfile? this.state.currentClassProfile.id: this.state.currentClassProfile} onChange={(event)=>{this.changeCurrentClassProfile(event.target.value)}}>
                            <option value={null} disabled selected>Select Class Profile</option>
                            {
                                this.props.currentAddressProfile.addressProfiles.map((addressClassProfile)=>(
                                    <option key={addressClassProfile.id} value={addressClassProfile.id}>{addressClassProfile.id}</option>
                                ))
                            }
                        </select>
                        <div style={{display:"inline"}}><Code>{this.state.currentClassProfile != null? this.state.currentClassProfile.id: "null"}</Code></div>
                    </div>
                    <Collapse isOpen={this.state.currentClassProfile!=null}>
                        <Tabs selectedTabId={this.state.selectedTabId} id={"LayoutPanelTabs"} renderActiveTabPanelOnly={true} onChange={(tabId: TabId)=>{this.setState({selectedTabId: tabId})}}>
                            <Tab id={"formTemplate"} title={"Form Template"} panel={<FormTemplatePanel currentAddressProfile={this.state.currentAddressProfile} currentClassProfile={this.state.currentClassProfile} changeStateHandler={this.state.changeStateHandler} />}></Tab>
                            <Tab id={"displayTemplate"} title={"Display Template"} panel={<DisplayTemplatePanel />}></Tab>
                        </Tabs>
                    </Collapse>
                </div>
            </div>
        )
    }

    changeCurrentClassProfile(profileId: string | null) {
        if(profileId != null){
            this.props.currentAddressProfile.addressProfiles.forEach((addressClassProfile)=>{
                if(addressClassProfile.id == profileId){
                    this.setState({currentClassProfile: addressClassProfile});
                }
            });
        }
    }
}

class FormTemplatePanel extends React.Component<FormTemplatePanelProps, any>{
    constructor(props){
        super(props);
        this.state={
            currentAddressProfile : this.props.currentAddressProfile,
            currentClassProfile: this.props.currentClassProfile,
            changeStateHandler: this.props.changeStateHandler,
            currentFormTemplate: null,

            isFormOpen: false,

            //form input
            id: "",
            name: "",
            description: "",
            localization: {locale: "", script: "", writingSystem: "", textDirection: "leftToRightTopToBottom"},
        }
    }

        componentDidMount(){
        log.info(this.props.currentAddressProfile);
    }

    handleFormOpen() {
        this.setState({isFormOpen: !this.state.isFormOpen});
    }

    handleTextDirectionChange(verticalValue:string|null, horizontalValue:string|null, callBack: any) {
        let oldVerticalValue = "";
        let oldHorizontalValue = "";

        let textDirection = this.state.localization.textDirection;

        textDirection.includes("TopToBottom")
        ? oldVerticalValue = "TopToBottom"
        : oldVerticalValue = "BottomToTop"

        textDirection.includes("leftToRight")
        ? oldHorizontalValue = "leftToRight"
        : oldHorizontalValue = "rightToLeft"

        if(verticalValue){
            oldVerticalValue = verticalValue;
        }else if(horizontalValue){
            oldHorizontalValue = horizontalValue;
        }

        this.setState({localization: {...this.state.localization, textDirection: oldHorizontalValue + oldVerticalValue}}, ()=>{log.info(this.state.localization.textDirection)});
    }

    handleEditFormTemplate(formId:string){
        this.state.currentClassProfile.formTemplates.forEach(formTemplate => {
            if(formTemplate.id == formId) {
                this.setState({currentFormTemplate: formTemplate});
            }
        });
    }

    createTemplate() {

        const newCurrentClassProfile = JSON.parse(JSON.stringify(this.state.currentClassProfile));

        let isIdUsed = false;

        newCurrentClassProfile.formTemplates.forEach(item => {
            if(item.id == this.state.id) {
                isIdUsed = true;
            }
        });

        if(isIdUsed) {
            alert("\"" + this.state.id + "\"" + " is being used.\nTry another one");
            return;
        }

        const formTemplate = {
            id: this.state.id,
            name : this.state.name,
            description: this.state.description,
            localization: this.state.localization,
            dimensions: [],
            orientation: null,
            lines:[],
        }

        newCurrentClassProfile.formTemplates.splice(newCurrentClassProfile.length, 0 , formTemplate)

        this.state.changeStateHandler("class", "edit", newCurrentClassProfile);

        this.setState({
            isFormOpen: false,
            currentClassProfile: newCurrentClassProfile,

            //form input
            id: "",
            name: "",
            description: "",
            localization: {locale: "", script: "", writingSystem: "", textDirection: "leftToRightTopToBottom"},
        });
    }

    render(){
        return(
            <>
            <Collapse isOpen={this.state.currentClassProfile != null && this.state.currentFormTemplate==null}>
            <div style={{borderRadius: "5px", backgroundColor: "#15B371",}}>
                <Collapse isOpen={!this.state.isFormOpen}>
                    {
                        this.state.currentClassProfile.formTemplates.length == 0
                        ? <>there is no existing form template</>
                        : <></>
                    }
                    {
                        this.state.currentClassProfile.formTemplates.map((form)=>(
                            <div key={form.id} style={{padding:"5px", display:"flex", justifyContent:"space-between"}}>
                                <div style={{textOverflow:"ellipsis", whiteSpace:"nowrap", width:"30%", overflow:"hidden"}}>{form.id}: {form.name}</div>
                                <div style={{textOverflow:"ellipsis", whiteSpace:"nowrap", width:"30%", overflow:"hidden"}}>{form.description}</div>
                                <div>
                                    <AnchorButton text={"edit"} onClick={()=>{this.handleEditFormTemplate(form.id)}}/>
                                    <AnchorButton text={"delete"}/>
                                </div>
                            </div>
                        ))
                    }
                    

                </Collapse>
                {this.state.isFormOpen
                    ?<div style={{borderRadius: "5px", padding:"5px", textAlign:"center" ,backgroundColor:"#FF7373", cursor:"pointer"}} onClick={()=>{this.handleFormOpen()}}>Discard New Template</div>
                    :<div style={{borderRadius: "0 0 5px 5px", padding:"5px", textAlign:"center" ,backgroundColor:"#3DCC91", cursor:"pointer"}} onClick={()=>{this.handleFormOpen()}}>New Template</div>
                }
                <Collapse isOpen={this.state.isFormOpen}>
                    <div style={{padding:"5px"}}>
                        <table>
                            <tr>
                                <td>ID</td>
                                <td>:</td>
                                <td>
                                    <InputGroup value={this.state.id} onChange={(event)=>{this.setState({id: event.target.value})}}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Name</td>
                                <td>:</td>
                                <td>
                                    <InputGroup value={this.state.name} onChange={(event)=>{this.setState({name: event.target.value})}}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Description</td>
                                <td>:</td>
                                <td>
                                    <InputGroup value={this.state.description} onChange={(event)=>{this.setState({description: event.target.value})}}/>
                                </td>
                            </tr>
                            <tr>
                                <td>Localization</td>
                                <td>:</td>
                                <td style={{padding:"0"}}>
                                    <table>
                                        <tr>
                                            <td>Locale</td>
                                            <td>:</td>
                                            <td style={{padding:"0"}}>
                                                <InputGroup value={this.state.localization.locale}
                                                    onChange={(event)=>{
                                                        this.setState({localization: {...this.state.localization, locale: event.target.value,}})}
                                                    }
                                                />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Script</td>
                                            <td>:</td>
                                            <td style={{padding:"0"}}>
                                                <InputGroup value={this.state.localization.script}
                                                        onChange={(event)=>{
                                                            this.setState({localization: {...this.state.localization, script: event.target.value,}})}
                                                        }
                                                    />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Writing System</td>
                                            <td>:</td>
                                            <td style={{padding:"0"}}>
                                                <InputGroup value={this.state.localization.writingSystem}
                                                        onChange={(event)=>{
                                                            this.setState({localization: {...this.state.localization, writingSystem: event.target.value,}})}
                                                        }
                                                    />
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>Text Direction</td>
                                            <td>:</td>
                                            <td style={{padding:"0"}}>
                                                <select
                                                    style={{width:"130px"}}
                                                    value={this.state.localization.textDirection.includes("TopToBottom")?"TopToBottom":"BottomToTop"}
                                                    onChange={(event)=>{this.handleTextDirectionChange(event.target.value, null, this.forceUpdate.bind(this))}}
                                                >
                                                    <option value="TopToBottom">Top to Bottom</option>
                                                    <option value="BottomToTop">Bottom to Top</option>
                                                </select>
                                                <select
                                                    style={{width:"130px", marginLeft:"5px"}}
                                                    value={this.state.localization.textDirection.includes("leftToRight")?"leftToRight":"rightToLeft"} 
                                                    onChange={(event)=>{this.handleTextDirectionChange(null,event.target.value, this.forceUpdate.bind(this))}} 
                                                >
                                                    <option value="leftToRight">Left to Right</option>
                                                    <option value="rightToLeft">Right to Left</option>
                                                </select>
                                            </td>
                                        </tr>
                                    </table>
                                </td>
                            </tr>
                        </table>
                    </div>
                    <div style={{borderRadius: "0 0 5px 5px", padding:"5px", textAlign:"center", backgroundColor:"#999", cursor:"pointer"}} onClick={()=>{this.createTemplate()}}>Create Template</div>
                </Collapse>     
            </div>
            </Collapse>
            {
                this.state.currentFormTemplate != null && this.state.currentClassProfile != null
                ?
                    <div style={{borderRadius: "5px", backgroundColor: "#15B371",marginTop:"5px",}}>
                        <Collapse isOpen={true}>{/*debug mode*/}
                                <FormTemplateEditPanel currentAddressProfile={this.state.currentAddressProfile} currentClassProfile={this.state.currentClassProfile} currentFormTemplate={this.state.currentFormTemplate} />
                        </Collapse>
                    </div>
                :<></>
            }
            </>
        )
    }
}

class FormTemplateEditPanel extends React.Component<any, any>{
    constructor(props){
        super(props);
        this.state={
            currentAddressProfile: this.props.currentAddressProfile,
            currentClassProfile: this.props.currentClassProfile,
            currentFormTemplate: this.props.currentFormTemplate,

            //this component data
            // formLayout: [], //should be a 2d array
        }
    }

    // componentDidMount() {
    //     var formLayout;
    //     if(this.state.currentFormTemplate.lines.length === 0) {
    //         //auto fill all component to the array
    //         this.state.currentClassProfile.componentProfiles.forEach((componentPointer)=>{
    //             this.state.currentAddressProfile.componentProfiles.forEach(componentProfile => {
    //                 if(componentProfile.key == componentPointer.addressComponentProfileKey) {
    //                     const newStaticText = componentProfile.key;
    //                     const newData = componentProfile.example;

    //                     const newLine = {element: [
    //                         {type: "staticText", element: {value: newStaticText},},
    //                         {type: "data", element: {value: newData},},
    //                     ]};

    //                     formLayout.splice(formLayout.length, 0, newLine);
    //                 }
    //             });
    //         });
    //     } else {
    //         //read the current formTemplate data
    //     }
    // }

    handleUpdate(targetComponentKey: string, type: string, data: string) {

    }

    render() {
        const itemStyle = {
            marginTop: "10px",
            borderRadius: "5px",
            background: "#FFFFFF",
        } as React.CSSProperties;
    
        const itemHeadStyle = {
            padding: "7px 5px 30px 5px",
            height: "15px",
            fontSize: "20px",
            width: "100%",
        } as React.CSSProperties;
    
        const itemHeadButtonStyle = {
            padding: "5px",
            float: "right",
        } as React.CSSProperties;
    
        const itemHrStyle = {
            width: "100%",
            margin: "0 0 7px 0",
            clear: "both",
        } as React.CSSProperties;
    
        const itemBodyStyle = {
            padding: "5px",
            width: "100%",
        } as React.CSSProperties;
    
        const rightDivStyle = {
            float: "right",
        }
    
        const subSubItemSytle = {
            backgroundColor: "#3DCC91",
            marginLeft: "5px",
            marginRight: "5px", 
            // color: "#FFF",
        }
    
        const subSubItemHeadStyle = {
            padding: "10px 5px 5px",
            fontSize: "15px",
            height: "unset",
        }
    
        const subSubitemBodyStyle = {
            fontSize: "15px",
        }

        // Style for right-hand side Display
        const displayDivStyle = {
            borderRadius: "5px",
            backgroundColor: "white",
            padding: "5px",
            margin: "10px 5px"
        }

        const classTitleComponent = {
            fontWeight: "bold",
            textAlign: "center",

        }

        return (
            <div style={{display:"flex"}}>
                <div style={{flex:"50%", backgroundColor:"orange", borderRadius:"5px"}}>
                    {/* component display */}
                    {
                        this.state.currentClassProfile.componentProfiles.map((componentPointer)=>(
                            <EditableFieldItem componentPointer={componentPointer} currentAddressProfile={this.state.currentAddressProfile} currentFormTemplate={this.state.currentFormTemplate} handleUpdate={this.state.handleUpdate.bind(this)} />
                        ))
                    }                    
                </div>
                <div style={{backgroundColor:"gray", width:"2px", margin:"0 2.5px"}}></div>
                <div style={{flex:"50%", backgroundColor:"orange", borderRadius:"5px"}}>
                    {/* demo display */}
                    <div style={displayDivStyle}>
                        <div style={classTitleComponent}>
                            {/* Hardcode Data */}
                            Street Address
                        </div>
                        <hr style={itemHrStyle} />
                        <table>
                                <tr>
                                    {/* Hardcode Data */}
                                    <td style={{fontWeight: "bold",}}>Address Number</td><td>:</td><td>23</td>
                                </tr>
                                <tr>
                                    {/* Hardcode Data */}
                                    <td style={{fontWeight: "bold",}}>Locality name</td><td>:</td><td>Yuen Long</td>
                                </tr>
                            </table>
                    </div>
                </div>
            </div>
        )
    }
}

class EditableFieldItem extends React.Component<any, any>{
    constructor(props) {
        super(props);
        this.state={
            componentPointer: this.props.componentPointer,
            currentAddressProfile: this.props.currentAddressProfile,
            currentFormTemplate: this.props.currentFormTemplate,
            handleUpdate: this.props.handleUpdate,

            //field data
            fieldName: this.props.componentPointer.addressComponentProfileKey,
            example: "Example",
        };
    }

    componentDidMount() {
        // log.info(this.state.componentPointer);
        // log.info(this.state.currentAddressProfile);
        // log.info(this.state.currentFormTemplate);
        this.props.currentAddressProfile.componentProfiles.forEach(componentProfile => {
            if(componentProfile.key == this.props.componentPointer.addressComponentProfileKey) {
                this.setState({example: componentProfile.example});
            }
        });
    }

    updateFieldName(data) {
        this.state.handleUpdate(this.state.componentPointer.addressComponentProfileKey, "fieldName", data);
    }

    updateExample(data) {

    }

    render(){
        const itemStyle = {
            marginTop: "10px",
            borderRadius: "5px",
            background: "#FFFFFF",
        } as React.CSSProperties;
    
        const itemHeadStyle = {
            padding: "7px 5px 30px 5px",
            height: "15px",
            fontSize: "20px",
            width: "100%",
        } as React.CSSProperties;
    
        const itemHeadButtonStyle = {
            padding: "5px",
            float: "right",
        } as React.CSSProperties;
    
        const itemHrStyle = {
            width: "100%",
            margin: "0 0 7px 0",
            clear: "both",
        } as React.CSSProperties;
    
        const itemBodyStyle = {
            padding: "5px",
            width: "100%",
        } as React.CSSProperties;
    
        const rightDivStyle = {
            float: "right",
        }
    
        const subSubItemSytle = {
            backgroundColor: "#3DCC91",
            marginLeft: "5px",
            marginRight: "5px", 
            // color: "#FFF",
        }
    
        const subSubItemHeadStyle = {
            padding: "10px 5px 5px",
            fontSize: "15px",
            height: "unset",
        }
    
        const subSubitemBodyStyle = {
            fontSize: "15px",
        }
        return(
            <div style={{...itemStyle, ...subSubItemSytle, marginBottom: "5px"}}>
                <div style={{...itemHeadStyle, ...subSubItemHeadStyle}}>
                    {this.state.componentPointer.addressComponentProfileKey}
                    <div style={rightDivStyle}>
                            min: {this.state.componentPointer.addressComponentSpecification.minCardinality} | max: {this.state.componentPointer.addressComponentSpecification.maxCardinality}
                    </div>
                </div>
                <hr style={itemHrStyle} />
                <div style={{...itemBodyStyle,...subSubitemBodyStyle}}>
                    <table>
                        <tr>
                            <td style={{fontWeight: "bold",}}>Field Name</td>
                            <td>:</td>
                            <td>
                                <InputGroup value={this.state.fieldName} onChange={(event)=>{this.updateFieldName(event.target.value)}} />
                            </td>
                        </tr>
                        <tr>
                            <td style={{fontWeight: "bold",}}>Example</td>
                            <td>:</td>
                            <td>
                                <InputGroup value={this.state.example} onChange={(event)=>{this.updateExample(event.target.value)}} />
                            </td>
                        </tr>
                    </table>
                </div>
                <hr style={itemHrStyle} />
                <div style={{...itemHeadStyle, ...subSubItemHeadStyle, padding: "2px 5px 14px"}}>
                    Row: 
                    {/* Hardcode Data */}
                    <select>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>
                    Order: 
                    {/* Hardcode Data */}
                    <select>
                        <option value="1">1</option>
                        <option value="2">2</option>
                    </select>

                    <div style={rightDivStyle}>
                        <AnchorButton intent="success" text={"Duplicate"}/>
                    </div>
                </div>
            </div>
        );
    }
}

class DisplayableFieldItem extends React.Component<any, any>{
    constructor(props) {
        super(props);
        this.state={

        };
    }

    render(){
        return(
            <></>
        );
    }
}

class DisplayTemplatePanel extends React.Component<DisplayTemplateProps, any>{
    constructor(props){
        super(props);
        this.state={
            
        }
    }
    render(){
        return(
            <></>
        )
    }
}

export interface LayoutPanelProps{
    currentAddressProfile: AddressProfile,
    changeStateHandler: any,
}

interface FormTemplatePanelProps {
    currentAddressProfile: AddressProfile,
    currentClassProfile: AddressClassProfile,
    changeStateHandler: any,
}

interface DisplayTemplateProps {
    
}