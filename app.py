from fastapi import FastAPI, UploadFile, File, Depends, HTTPException, Cookie, Request, Response
from fastapi.encoders import jsonable_encoder
from fastapi.responses import FileResponse, JSONResponse, RedirectResponse
from fastapi.staticfiles import StaticFiles

from sqlalchemy.orm import Session
import models
import database
from ai_service import ai_service_instance as ai_service
import os

app = FastAPI()

# Create tables
models.Base.metadata.create_all(bind=database.engine)

# Serve static files
app.mount("/static", StaticFiles(directory="static"), name="static")

@app.exception_handler(Exception)
async def global_exception_handler(request, exc):
    print(f"GLOBAL ERROR: {exc}")
    import traceback
    traceback.print_exc()
    return JSONResponse(status_code=500, content={"detail": str(exc)})

@app.get("/")
def read_root(request: Request, session: str = Cookie(None)):
    if session != "authenticated":
        return RedirectResponse(url="/login")
    return FileResponse("static/index.html")

@app.get("/login")
def login_page():
    return FileResponse("static/login.html")

@app.post("/login")
async def login(request: Request, response: Response):
    form_data = await request.form()
    username = form_data.get("username")
    password = form_data.get("password")
    
    if username == "admin" and password == "admin123":
        response = RedirectResponse(url="/", status_code=303)
        response.set_cookie(key="session", value="authenticated")
        return response
    else:
        return RedirectResponse(url="/login?error=1", status_code=303)

@app.get("/logout")
def logout():
    response = RedirectResponse(url="/login")
    response.delete_cookie("session")
    return response


@app.get("/files")
def get_files(db: Session = Depends(database.get_db)):
    try:
        # standard join
        results = db.query(models.RPGFile, models.Category.name).outerjoin(models.Category).all()
        
        files_data = []
        for file_obj, cat_name in results:
            # Manually build dict to avoid any serialization/metadata issues
            data = {
                "id": file_obj.id,
                "filename": file_obj.filename,
                "content": file_obj.content,
                "documentation": file_obj.documentation,
                "business_logic": file_obj.business_logic,
                "mermaid_diagram": file_obj.mermaid_diagram,
                "uploaded_at": file_obj.uploaded_at,
                "category_id": file_obj.category_id,
                "category_name": cat_name if cat_name else "Sin Categoría",
                "html_diagram": file_obj.html_diagram
            }
            files_data.append(data)
        
        print(f"DEBUG: get_files successfully returned {len(files_data)} files")
        return jsonable_encoder(files_data)
    except Exception as e:
        import traceback
        print(f"CRITICAL ERROR in get_files: {e}")
        traceback.print_exc()
        return []

@app.post("/upload")
async def upload_file(
    file: UploadFile = File(...), 
    category_id: int = None,
    db: Session = Depends(database.get_db)
):
    print(f"DEBUG: Upload request for {file.filename}, category_id parameter={category_id}")
    content = await file.read()
    code_text = content.decode("utf-8", errors="ignore")
    
    # Analyze with AI
    analysis = ai_service.analyze_rpg(code_text)
    
    # Save to DB
    db_file = models.RPGFile(
        filename=file.filename,
        content=code_text,
        documentation=analysis["documentation"],
        business_logic=analysis["business_logic"],
        mermaid_diagram=analysis["mermaid_diagram"],
        category_id=category_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    print(f"DEBUG: Saved file with ID {db_file.id}, category={db_file.category_id}")
    
    return db_file

@app.get("/files/{file_id}")
def get_file(file_id: int, db: Session = Depends(database.get_db)):
    file = db.query(models.RPGFile).filter(models.RPGFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@app.delete("/files/{file_id}")
def delete_file(file_id: int, db: Session = Depends(database.get_db)):
    file = db.query(models.RPGFile).filter(models.RPGFile.id == file_id).first()
    if not file:
        raise HTTPException(status_code=404, detail="File not found")
    db.delete(file)
    db.commit()
    return {"message": "File deleted successfully"}

@app.post("/files/{file_id}/generate-diagram")
def generate_diagram(file_id: int, db: Session = Depends(database.get_db)):
    db_file = db.query(models.RPGFile).filter(models.RPGFile.id == file_id).first()
    if not db_file:
        raise HTTPException(status_code=404, detail="File not found")
    
    # Check if we already have a cached diagram
    if db_file.html_diagram:
        print(f"DEBUG: Returning cached diagram for file {file_id}")
        return {"html_diagram": db_file.html_diagram, "cached": True}
    
    print(f"DEBUG: Generating new diagram via AI for file {file_id}")
    # Generate diagram via AI
    html_diagram = ai_service.generate_html_diagram(
        db_file.content, 
        db_file.documentation, 
        db_file.business_logic
    )
    
    # Save to DB
    db_file.html_diagram = html_diagram
    db.commit()
    
    return {"html_diagram": html_diagram, "cached": False}
@app.put("/files/{file_id}")
def update_file(file_id: int, file_update: dict, db: Session = Depends(database.get_db)):
    print(f"DEBUG: PUT /files/{file_id} with payload: {file_update}")
    db_file = db.query(models.RPGFile).filter(models.RPGFile.id == file_id).first()
    if not db_file:
        print(f"DEBUG: File {file_id} not found for update")
        raise HTTPException(status_code=404, detail="File not found")
    
    if "documentation" in file_update:
        db_file.documentation = file_update["documentation"]
    if "business_logic" in file_update:
        db_file.business_logic = file_update["business_logic"]
    if "category_id" in file_update:
        new_cat = file_update["category_id"]
        print(f"DEBUG: Changing category from {db_file.category_id} to {new_cat}")
        db_file.category_id = new_cat
    
    try:
        db.commit()
        db.refresh(db_file)
        print(f"DEBUG: Successfully committed update for file {file_id}")
        return db_file
    except Exception as e:
        print(f"ERROR committing update: {e}")
        db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

# --- Category Endpoints ---

@app.get("/categories")
def get_categories(db: Session = Depends(database.get_db)):
    try:
        return db.query(models.Category).all()
    except Exception as e:
        print(f"Error fetching categories: {e}")
        return []

@app.post("/categories")
def create_category(category: dict, db: Session = Depends(database.get_db)):
    db_category = models.Category(name=category["name"], description=category.get("description"))
    db.add(db_category)
    db.commit()
    db.refresh(db_category)
    return db_category

@app.delete("/categories/{cat_id}")
def delete_category(cat_id: int, db: Session = Depends(database.get_db)):
    cat = db.query(models.Category).filter(models.Category.id == cat_id).first()
    if not cat:
        raise HTTPException(status_code=404, detail="Category not found")
    # Set category_id to NULL for files in this category
    db.query(models.RPGFile).filter(models.RPGFile.category_id == cat_id).update({models.RPGFile.category_id: None})
    db.delete(cat)
    db.commit()
    return {"message": "Category deleted"}

@app.get("/manage-categories")
def categories_page():
    return FileResponse("static/categories.html")

@app.get("/edit")
def edit_page():
    return FileResponse("static/edit.html")

@app.get("/knowledge")
def knowledge_page():
    return FileResponse("static/chat.html")

@app.post("/chat")
async def chat_with_agent(payload: dict, db: Session = Depends(database.get_db)):
    query = payload.get("query")
    filter_type = payload.get("filter_type", "all") # all, category, file
    filter_id = payload.get("filter_id")
    
    if not query:
        raise HTTPException(status_code=400, detail="Query is required")
    
    # Fetch relevant files based on filter
    query_obj = db.query(models.RPGFile)
    if filter_type == "category" and filter_id:
        query_obj = query_obj.filter(models.RPGFile.category_id == filter_id)
    elif filter_type == "file" and filter_id:
        query_obj = query_obj.filter(models.RPGFile.id == filter_id)
        
    files = query_obj.all()
    
    if not files:
        if filter_type != "all":
            return {"response": "No encontré archivos en el filtro seleccionado. Por favor, selecciona otro filtro o consulta sobre todo el sistema."}
        else:
            return {"response": "Aún no hay archivos subidos en el sistema."}

    context = ""
    for f in files:
        context += f"ARCHIVO: {f.filename}\nDOCUMENTACION: {f.documentation}\nLOGICA: {f.business_logic}\nCODIGO:\n{f.content[:800]}\n---\n"
    
    # Cap context length if needed
    if len(context) > 15000:
        context = context[:15000] + "\n...[Contexto truncado por longitud]..."

    response = ai_service.chat_query(query, context)
    return {"response": response}

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

