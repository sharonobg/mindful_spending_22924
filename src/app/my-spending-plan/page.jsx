"use client"

import React,{useState,useEffect} from 'react';
import {useRouter} from 'next/navigation';
import {useSession} from 'next-auth/react'
import {ToastContainer ,toast} from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import "react-datepicker/dist/react-datepicker.css";
import DatePicker from "react-datepicker";


//this client page is used to edit planned spending amounts, add or remove categories, 
//show my categories with checkbox- user can uncheck category and amt 0. unless there is a previous amount stored in mongodb
//assign checked categories to user
//this will be the dropdown list in add-transaction unless user wants to add more- then click (popup category list? to add?)
//categories with an amount > 0 or previously checked will be checked on load. These will be retrieved for the transaction-titles-totals
//need section - available categories not in spending plan (could be via sort)
{/*export default function MySpendingPlan() {*/}
const CreateSpendingPlan = () => {
  const [newVal,setNewVal]=([])
  const [selections,setSelections]=useState([])
  const[selectedcats,setSelectedcats]=useState([])
    const [category,setCategory]=useState("")
    const [explain,setExplain]=useState("")
    const [categories,setCategories]=useState([])
    const [mycategories,setMycategories]=useState([])
    const [planmonthyear,setPlanmonthyear]=useState(new Date())
    const [planamount,setPlanamount]=useState("")
    //const [categoryId,setCategoryId]= useState("")
    //const [title,setTitle]=useState("")
    const [categorynotes,setCategorynotes]= useState("")
    const [mycategoryId,setMycategoryId]= useState("")
    const [isChecked, setIsChecked] = useState(false);
    //income
    const [incomeamount,setIncomeamount]=useState("");
    const [incometype,setIncometype]=useState("");
    const [incomedate,setIncomedate]=useState(new Date());
    const [incomedescr,setIncomedescr]=useState("");
    const {data:session,status} = useSession();
    //const isCheckedId="";
    const router= useRouter();
   
    useEffect(() => {
      fetch('/api/category')
        .then((res) => res.json())
        .then(({categories}) => {
          setCategories(categories)
        })
    }, [])
    
    if(status === 'loading'){
      return <p>Loading...</p>
  }
    if(status === 'unauthenticated'){
      return <p className="font-bold text-red-500">Access Denied</p>
  }
  // checkboxes - set up category plan
  const handleCategory = async (e) => {
    //e.preventDefault();
    try{
      const target = e.currentTarget;
      const catid = target.id;
      //console.log(catid)
      setSelectedcats(() => 
      target.checked ? [...selectedcats,catid]
      : selectedcats.filter((mycategory) => mycategory !== catid))
      setMycategoryId(catid)
      //setIsChecked(!isChecked)
    } catch(err){
      console.log(err)
    }
  }
  //add a new category by owner



  //add to plan:
//   const handleCategories = async (e,index) => {
//     e.preventDefault();
//     try {
//       //const target = e.currentTarget;
//       const val = e.target.value;
//   //let idex = index;
//   console.log('index',index)  
//   let newSelection = [
//     {
//       mycategoryId:mycategoryId,
//       categorynotes:categorynotes,
//       explain:explain,
//       isChecked:true,
//       planamount:parseFloat(planamount).toFixed(2),
//     }
//   ]
//   let newSel = [...mycategories, newSelection]
//   let newRow = newSel[index].value;
//   //  let newCat = [...mycategories.mycategoryId];
//   //  mycategories.mycategoryId[idx].value = e.target.value;
//   //  setMycategoryId(newCat);
// setMycategories(newRow);
// console.log('handleCategories newSel',newSel)
// console.log('handleCategories newRow',newRow)
// console.log('handleCategories mycategories',mycategories)
//     } catch(err){
//       console.log(err)
//     }
//   }
  const handleNewCat = (e,idx) => {
    let newCat = [...mycategories.mycategoryId];
    mycategories.mycategoryId[idx].value = e.target.value;
    setMycategoryId(newCat);
  }
  //setNames(current => [...current, 'Carl']);

    //add to plan:
    const handleCategoriesOld = async (e,index) => {
      e.preventDefault();
      try {
        const newSelection = {
          mycategoryId:mycategoryId,
          categorynotes:categorynotes,
          explain:explain,
          isChecked:true,
          planamount:parseFloat(planamount).toFixed(2),
          authorId:session?.user?._id,
        }
        //console.log('newSelection',newSelection)
        
  selections.push(newSelection)
  
  //console.log('selections',selections)

  //setMycategories(mycategories => [...mycategories, selections]);
  setMycategories(selections)
  //mycategories.push(newSelection)
  //console.log('set mycategories',mycategories)

      } catch(err){
        console.log(err)
      }
      
    }
  //Button Create Spending Plan(form submit)
  const handleSubmitSp = async (e) => {
    e.preventDefault();
    const updatedCategories = [...mycategories];
    const categoryArr = mycategories.filter((mycategoryId, index) => {
    return mycategories.indexOf(mycategoryId) === index;
    });
    //console.log('categoryArr',categoryArr);
    updatedCategories.push(categoryArr);

    setMycategories(mycategories => [...mycategories,updatedCategories]);
    const body = {
      authorId:session?.user?._id,
      planmonthyear:new Date(planmonthyear),
      mycategories:mycategories
    }
    try{
      const res = await fetch('/api/my-spending-plan',{
      headers:{
            "Content-type":"application/json",
            "Authorization":`Bearer ${session?.user?.accessToken}`
          },
      method:'POST',
      body:JSON.stringify(body)
    })
    //console.log('client handleSubmit spendingplan res',res);
    //console.log('client handleSubmit spendingplan body',body);
    if(!res.ok){
            throw new Error("Error on spending plan or auth")
    }
    const spendingplan = await res.json();
    //console.log('spendingplan ln128',spendingplan)
        //router.push(`/spending-plan/${spendingplan?._id}`)
        //router.refresh();
        //router.push('/');
    }catch (error) {
      console.log('not working',error)
      toast.error("Handle Submit did't go through");
      return
    }
}
const handleSubmitInc = async (e) => {
  e.preventDefault();
  const body = {
    incomedate:new Date(incomedate),
    incomedescr,
    incometype,
    incomeamount:parseFloat(incomeamount).toFixed(2),
  }

  //uptohere
  try{
    const res = await fetch('/api/my-spending-plan',{
    headers:{
          "Content-type":"application/json",
          "Authorization":`Bearer ${session?.user?.accessToken}`
        },
    method:'POST',
    body:JSON.stringify(body)
  })
  //console.log('client handleSubmit spendingplan res',res);
  //console.log('client handleSubmit spendingplan body',body);
  if(!res.ok){
          throw new Error("Error on spending plan or auth")
  }
  const spendingplan = await res.json();
  //console.log('spendingplan ln128',spendingplan)
      //router.push(`/spending-plan/${spendingplan?._id}`)
      //router.refresh();
      //router.push('/');
  }catch (error) {
    console.log('not working',error)
    toast.error("Handle Submit did't go through");
    return
  }
}
    return(
        <>
        <div className="flex flex-col self-center place-items-center border-l-orange-100">
        <h2 className="mb-8 text-lg font-bold text-center">Select categories for your spending plan</h2>
        <div  className="flex flex-row">
        <div  className="flex flex-col border-r-2 border-blue-500 min-w-fit">
        <div className="flex flex-col">
        {categories?.length > -1 ? (categories.slice(1).map((category,index) =>
        <div key={category._id} className="flex flex-col m-0 py-0 px-2 items-end">     
        <label htmlFor={category._id} className="m-0 py-0 px-2 align-items-center ">{category.title}
        <input 
        className="m-0 py-0 px-2 w-fit align-items-right ml-2 text-sm"
        name="checkbox"
        placeholder="Select Category"
        type="checkbox"
        value={category._id}
        id={category._id}
        onChange={handleCategory}
        />
        </label>
        </div>
        )): "no categories are available"}
        
        </div>
      </div>
      <div  className="flex flex-col px-5">
        <form onSubmit={handleSubmitSp} className="flex flex-col flex-wrap gap-5 my-3">
          <div  className="flex flex-col">
            <DatePicker
              className="ml-0"
                dateFormat="MMMM yyyy"
                showMonthYearPicker 
                selected={planmonthyear} 
                onChange={(date) => setPlanmonthyear(date)}
                />
          {selectedcats?.length > -1 ? (selectedcats.map((mycat,index) => 
            
              <div key={index} className="mycategoryArr flex flex-row m-0 p-0">{/*Cat:{mycat}Index:{index}*/}
                <input 
                onChange={(e) => setMycategoryId((e) => handleNewCat(e, idx))}
                value={mycat}
                id={mycat}
                className="px-2 py-2 m-0 border border-green-200 max-w-2xl text-charcoal-500 w-[250px]"
                name={mycat}
                placeholder="Category Id"
                type="text"
                />
              {/*<h2>{mycategoryId}-{mycat.mycategoryId}</h2>*/}
                <input onChange={(e) => [...mycategories,setCategorynotes(e.target.value)]}
                className="px-4 py-2 m-0 border border-green-200 text-charcoal-500 w-[350px]"
                name="category-notes"
                placeholder="Category Notes (for ex Mortgage: could be Chase"
                type="text"
                />
                {/*<h2>{categorynotes}</h2>*/}
                <input onChange={(e) => setPlanamount(e.target.value)}
                className="px-4 py-2 m-0 border border-green-200 text-charcoal-500 w-[100px]"
                name="planned-amt"
                placeholder="0.00"
                //selected={planamount}
                type="string"
                />
                <input onChange={(e) => [...mycategories,setExplain(e.target.value)]}
                className="px-4 py-2 m-0 border border-green-200 text-charcoal-500 w-[350px]"
                name="explain"
                placeholder="Explain Difference"
                type="text"
                />
                {/*<h2>{planamount}</h2>
                on click should set - everything in my
                */}
                <button onClick={handleCategoriesOld}>Add to plan</button>
                </div>
                ) ): "no categories are available"}
                
              </div>
              <button className="w-fit bg-blue-400 rounded-md p-3 text-white font-semibold ml-0" type="submit">Create Spending Plan</button>
              
          </form>
        </div>
        </div>
        {/*<div  className="flex flex-col border-t-2 border-blue-400 w-3/4 my-5 place-items-center">
        <div  className="flex flex-col px-5">
          <form id="incsubmit" onSubmit={handleSubmitInc} className="flex flex-col flex-wrap gap-5 my-3">
          <div  className="flex flex-col">
            <DatePicker classname="border border-blue-600" selected={incomedate} onChange={(date) => setIncomedate(date)} />
            <input onChange={(e) => setIncomedescr(e.target.value)}
              className="px-4 py-2 mt-4 mx-5 border border-green-200 text-green-500"
              name="income-description"
              placeholder="Income Description"
              type="text"
                />
              <select type="text" value ={incometype} onChange={(e) => setIncometype(e.target.value)}>
                <option value="wages">Wages</option>
                <option value="tips">Tips</option>
                <option value="interest">Interest Income</option>
                <option value="retirement-income">Retirement Income</option>
                <option value="child-support">Child Support</option>
                <option value="other">Other</option>
                </select>
                <input onChange={(e) => setIncomeamount(e.target.value)}
                name="incomeamount"
                placeholder="0.00"
                type="string"
                />
              </div>
              <button className="w-fit bg-blue-400 rounded-md p-3 text-white font-semibold ml-0" type="submit">Create Planned Income</button>
              
          </form>
          </div>
      </div>*/}
</div>
    
       <ToastContainer />  
        
        </> )
}
export default CreateSpendingPlan
